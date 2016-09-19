'use strict';

var aws = require('aws-sdk');
var cloudFormation = new aws.CloudFormation({ apiVersion: '2010-05-15' });
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
        console.log('Deleting stack', params.StackName);
        cloudFormation.deleteStack(params, function (error, data) {
            if (error) {
                return callback(error);
            }
            if (options.shouldWait()) {
                console.log('Waiting for stack deletion to complete...');
                return cloudFormation.waitFor('stackDeleteComplete', params, callback);
            }
            callback(null, data);
        });
    }
};

function buildParameters(config) {
    return {
        StackName: config.StackName
    };
}
