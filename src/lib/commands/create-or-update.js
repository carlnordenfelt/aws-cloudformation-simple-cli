'use strict';

var aws = require('aws-sdk');
var cloudFormation = new aws.CloudFormation({ apiVersion: '2010-05-15' });
var configReader = require('../config-reader');
var create = require('./create');
var update = require('./update');

module.exports = {
    run: function run(options, callback) {
        var config = configReader(options);
        var params = {
            StackName: config.StackName
        };
        console.log('Describing stack', params.StackName);
        cloudFormation.describeStacks(params, function (error, response) {
            if (error) {
                if (error.message.indexOf('does not exist') === -1) {
                    return callback(error);
                }
            }

            if (response && response.Stacks && response.Stacks.length > 0) {
                return create.run(options, callback);
            }
            return update.run(options, callback);
        });
    }
};
