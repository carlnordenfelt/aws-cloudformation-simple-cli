'use strict';

/* istanbul ignore next */
var options = require('./options');

/* istanbul ignore next */
module.exports = function usage(error) {
    if (error && error.message) {
        console.log('[Error] ' + error.message);
    }

    console.log('Usage: aws-cfn [command] [options]');
    console.log('Available Commands: ' + options.getValidCommands());
    console.log('Available Options:');
    Object.keys(options.getValidOptions()).forEach(function (optionKey) {
        console.log(optionKey + ': ' + options.getValidOptions()[optionKey].description);
    });
    process.exit(1);
};
