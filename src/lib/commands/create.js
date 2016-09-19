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
        console.log('Creating stack', params.StackName);
        cloudFormation.createStack(params, function (error, data) {
            if (error) {
                return callback(error);
            }
            if (options.shouldWait()) {
                console.log('Waiting for stack creation to complete...');
                return cloudFormation.waitFor('stackCreateComplete', { StackName: params.StackName }, callback);
            }
            callback(null, data);
        });
    }
};

function buildParameters(config) {
    var params = {
        StackName: config.StackName,
        Capabilities: config.Capabilities,
        DisableRollback: config.DisableRollback,
        NotificationARNs: config.NotificationARNs,
        OnFailure: config.OnFailure,
        ResourceTypes: config.ResourceTypes,
        Tags: config.Tags,
        TimeoutInMinutes: config.TimeoutInMinutes,
        Parameters: []
    };

    if (config.OnFailure) {
        params.OnFailure = config.OnFailure;
    } else if (config.DisableRollback) {
        params.DisableRollback = config.DisableRollback;
    }
    if (config.TemplateURL) {
        params.TemplateURL = config.TemplateURL;
    } else if (config.TemplateBody) {
        params.TemplateBody = fileHelper.read(config.TemplateBody);
    }

    if (config.StackPolicyURL) {
        params.TemplateURL = config.StackPolicyURL;
    } else if (config.StackPolicyBody) {
        params.StackPolicyBody = fileHelper.read(config.StackPolicyBody);
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
