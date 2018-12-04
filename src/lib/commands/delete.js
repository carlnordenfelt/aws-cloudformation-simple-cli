const aws            = require('aws-sdk');
const cloudFormation = new aws.CloudFormation({ apiVersion: '2010-05-15' });
const configReader   = require('../config-reader');
const log            = require('log4njs');

module.exports = async function (options) {
    const config = configReader(options);
    const params = buildParameters(config);

    if (options.isDryRun()) {
        log.info('Dry run mode');
        log.info('Parameters', params);
        return;
    }

    let response;
    try {
        log.info('Deleting stack', params.StackName);
        response = await cloudFormation.deleteStack(params).promise();
    } catch (error) {
        throw error;
    }

    if (options.shouldWait()) {
        log.info('Waiting for stack deletion to complete...');
        response = await cloudFormation.waitFor('stackDeleteComplete', params).promise();
    }

    return response;
};

function buildParameters(config) {
    return {
        StackName: config.StackName
    };
}
