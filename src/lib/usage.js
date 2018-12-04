/* istanbul ignore file */
const options = require('./options');
const log     = require('log4njs').options({ hideDate: true });

module.exports = function usage() {
    log.info('Usage: aws-cfn [command] [options]');
    log.info('Available Commands: ' + options.getValidCommands());
    log.info('Available Options:');
    Object.keys(options.getValidOptions()).forEach(function (optionKey) {
        log.info('\t' + optionKey + ': ' + options.getValidOptions()[optionKey].description);
    });
    process.exit(1);
};
