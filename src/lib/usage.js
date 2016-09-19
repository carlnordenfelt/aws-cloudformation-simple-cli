'use strict';

/* istanbul ignore next */
var options = require('./options');

/* istanbul ignore next */
module.exports = function usage(error) {
    if (error) {
        console.log('[Error] ' + error.message);
    }

    if (error.command) {
        console.log('Usage: aws-cfn ' + error.command + ' [options]');
    } else {
        console.log('Usage: aws-cfn [command] [options]');
    }
    console.log('Available Options:');
    Object.keys(options.getOptions()).forEach(function (optionKey) {
        console.log(optionKey + ': ' + options.getOptions()[optionKey].description);
    });
    process.exit(1);
};
