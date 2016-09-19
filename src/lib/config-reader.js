'use strict';
var fileHelper = require('./file-helper');
var _ = require('lodash');

module.exports = function getConfig(options) {
    var configFile = JSON.parse(fileHelper.read(options.get('config-file')));
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
