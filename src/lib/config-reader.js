const fileHelper = require('./read-file');
const _          = require('lodash');
const log        = require('log4njs');

module.exports = function getConfig(options) {
    let configFile;
    try {
        let rawConfig = fileHelper(options.getConfigFile()).toString();
        rawConfig     = processPlaceholders(rawConfig, options.getPlaceholders());
        configFile    = JSON.parse(rawConfig);
    } catch (error) {
        log.error('Unable to read config file', error);
        throw error;
    }

    let config;

    if (options.getEnvironment()) {
        if (!configFile[options.getEnvironment()]) {
            throw new Error('Environment not defined in config file: ' + options.getEnvironment());
        }

        config = configFile[options.getEnvironment()];
        if (configFile.default) {
            config = _.merge(configFile.default, config);
        }
    } else {
        if (!configFile.default) {
            throw new Error('No environment provided and no default config in configuration file');
        }
        config = configFile.default;
    }

    return config;
};

function processPlaceholders(rawConfig, placeholders) {
    const placeholderKeys = Object.keys(placeholders);
    for (let i = 0; i < placeholderKeys.length; i++) {
        const regexp = new RegExp(placeholderKeys[i], 'g');
        rawConfig    = rawConfig.replace(regexp, placeholders[placeholderKeys[i]]);
    }
    return rawConfig;
}
