'use strict';
var fileHelper = require('./file-helper');
var _ = require('lodash');

module.exports = function getConfig(options) {
    var rawConfig = fileHelper.read(options.getConfigFile()).toString();
    rawConfig = processPlaceholders(rawConfig, options.getPlaceholders());
    var configFile = JSON.parse(rawConfig);
    var config;
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
    var placeholderKeys = Object.keys(placeholders);
    for (var i = 0; i < placeholderKeys.length; i++) {
        var regexp = new RegExp(placeholderKeys[i], 'g');
        rawConfig = rawConfig.replace(regexp, placeholders[placeholderKeys[i]]);
    }
    return rawConfig;
}
