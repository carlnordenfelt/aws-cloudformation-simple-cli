'use strict';

var aws = require('aws-sdk');
var cloudFormation = new aws.CloudFormation({ apiVersion: '2010-05-15' });
var fileHelper = require('../file-helper');
var configReader = require('../config-reader');

module.exports = {
    run: function run(options, callback) {
        var config = configReader(options);
        var params = buildParameters(config);
        if (options.isDryRun()) {
            console.log('Dry run mode');
            console.log(params);
            return callback(null, null);
        }
        console.log('Updating stack', params.StackName);
        cloudFormation.updateStack(params, function (error, data) {
            if (error) {
                if (error.message === 'No updates are to be performed.') {
                    return callback(null, error.message);
                }
                return callback(error);
            }
            if (options.shouldWait()) {
                console.log('Waiting for stack update to complete...');
                return cloudFormation.waitFor('stackUpdateComplete', { StackName: params.StackName }, callback);
            }
            callback(null, data);
        });
    }
};

function buildParameters(config) {
    var params = {
        StackName: config.StackName,
        Capabilities: config.Capabilities,
        NotificationARNs: config.NotificationARNs,
        ResourceTypes: config.ResourceTypes,
        StackPolicyBody: config.StackPolicyBody,
        StackPolicyURL: config.StackPolicyURL,
        Tags: config.Tags,
        Parameters: [],
        UsePreviousTemplate: false
    };

    if (config.TemplateURL) {
        params.TemplateURL = config.TemplateURL;
    } else if (config.TemplateBody) {
        params.TemplateBody = fileHelper.read(config.TemplateBody);
    }
    if (config.StackPolicyURL) {
        params.StackPolicyURL = config.StackPolicyURL;
    } else if (config.StackPolicyBody) {
        params.StackPolicyBody = fileHelper.read(config.StackPolicyBody);
    }
    if (config.StackPolicyDuringUpdateURL) {
        params.StackPolicyDuringUpdateURL = config.StackPolicyDuringUpdateURL;
    } else if (config.StackPolicyDuringUpdateBody) {
        params.StackPolicyDuringUpdateBody = fileHelper.read(config.StackPolicyDuringUpdateBody);
    }

    if (config.Parameters) {
        var parameterKeys = Object.keys(config.Parameters);
        parameterKeys.forEach(function (parameterKey) {
            params.Parameters.push({
                ParameterKey: parameterKey,
                ParameterValue: config.Parameters[parameterKey]
            })
        });
    }
    return params;
}
