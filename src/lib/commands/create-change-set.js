const aws            = require('aws-sdk');
const cloudFormation = new aws.CloudFormation({ apiVersion: '2010-05-15' });
const log            = require('log4njs');

const configReader        = require('../config-reader');
const changeSetParameters = require('./change-set-parameters');

module.exports = async function (options) {
    const config = configReader(options);

    log.info('Processing update for stack', config.StackName);

    const stackExists = await doesStackExist(config.StackName);
    const params      = changeSetParameters(config, stackExists);
    await validateTemplate(params);

    if (options.isDryRun()) {
        log.info('Dry run mode');
        log.info('Parameters', params);
        return;
    }

    let changeSet = await createChangeSet(params);
    if (!changeSet) {
        return;
    }

    return await executeChangeSet(changeSet, params, stackExists, options);
};

async function doesStackExist(stackName) {
    const params = {
        StackName: stackName
    };

    let stackExists = false;
    try {
        log.info('Checking if stack already exists...');
        await cloudFormation.describeStacks(params).promise();
        log.info('Stack exists, proceeding with stack update...');
        stackExists = true;
    } catch (error) {
        if (error.message.indexOf('does not exist') === -1) {
            throw error;
        }

        log.info('Stack does not exist, proceeding with stack creation...');
    }

    return stackExists;
}

async function validateTemplate(params) {
    const validationParams = {};

    /* istanbul ignore if */
    if (params.TemplateURL) {
        validationParams.TemplateURL = params.TemplateURL;
    } else {
        validationParams.TemplateBody = params.TemplateBody;
    }

    log.info('Validating template...');

    try {
        await cloudFormation.validateTemplate(validationParams).promise();
    } catch (error) {
        log.error('Template validation errors discovered', error);
        throw error;
    }
}

async function createChangeSet(params) {
    log.info('Creating new ChangeSet...');
    const changeSet = await cloudFormation.createChangeSet(params).promise();
    log.info('ChangeSet created, pending completion...', changeSet.Id);

    try {
        await cloudFormation.waitFor('changeSetCreateComplete', { ChangeSetName: changeSet.Id }).promise();
    } catch (error) {
        await attemptGracefulCleanUp(changeSet);
        return undefined;
    }

    return changeSet;
}

async function attemptGracefulCleanUp(changeSet) {
    const describeChangeSet = await cloudFormation.describeChangeSet({ ChangeSetName: changeSet.Id }).promise();
    if (describeChangeSet.Status === 'FAILED' && describeChangeSet.StatusReason.indexOf('didn\'t contain changes') > -1) {
        log.info('ChangeSet contained no changes, deleting...');
        await cloudFormation.deleteChangeSet({ ChangeSetName: changeSet.Id }).promise();
        return;
    }

    throw new Error('ChangeSet creation failed: ' + describeChangeSet.StatusReason + '. See CloudFormation for further details');
}

async function executeChangeSet(changeSet, params, stackExists, options) {
    const executeChangeSetParams = {
        ChangeSetName: changeSet.Id,
        StackName: params.StackName
    };

    log.info('Executing ChangeSet...');
    let response = await cloudFormation.executeChangeSet(executeChangeSetParams).promise();

    if (options.shouldWait()) {
        log.info('Waiting for ChangeSet execution to complete...');
        const waitForAction = stackExists ? 'stackUpdateComplete' : 'stackCreateComplete';
        response            = cloudFormation.waitFor(waitForAction, { StackName: params.StackName }).promise();
    }

    return response;
}
