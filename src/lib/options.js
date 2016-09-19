'use strict';

var COMMAND_ARG_POS = 2;
var FIRST_ARG_POS = 3;
var ARGUMENT_PREFIX = '--';

function Options(args) {
    this.command = args[COMMAND_ARG_POS];
    this.dryRun = false;
    this.wait = true;
    this.environment = undefined;
    this.commandOptions = {};

    for (var i = FIRST_ARG_POS; i < args.length; i = i + 2) {
        if (args[i].startsWith(ARGUMENT_PREFIX)) {
            var key = args[i].substring(ARGUMENT_PREFIX.length);
            var value = args[i + 1];
            switch (key) {
                case 'dry-run':
                    this.dryRun = value === 'true';
                    break;
                case 'wait':
                    this.wait = value === 'true';
                    break;
                case 'environment':
                    this.environment = value;
                    break;
                default:
                    this.commandOptions[key] = value;
                    break;
            }
        }
    }
    Object.seal(this);
}
Options.getOptions = function () {
    return {
        'config-file': { description: 'String. Path to local configuration file', required: true },
        'environment': { description: 'String. Environment name', required: false },
        'dry-run': { description: 'Boolean. Preview CloudFormation request', required: false },
        'wait': { description: 'Boolean. Wait for resources to create before continuing', required: false }
    };
};
Options.prototype.getCommand = function () {
    return this.command;
};
Options.prototype.getEnvironment = function () {
    return this.environment;
};
Options.prototype.get = function (key) {
    return this.commandOptions[key];
};
Options.prototype.isDryRun = function () {
    return this.dryRun;
};
Options.prototype.shouldWait = function () {
    return this.wait;
};

Options.prototype.validate = function validate() {
    var commandOptions = Options.getOptions();
    var optionKeys = Object.keys(commandOptions);
    for (var i = 0; i < optionKeys.length; i++) {
        var optionKey = optionKeys[i];
        var option = commandOptions[optionKey];
        var providedValue = this.commandOptions[optionKey];

        if (providedValue === undefined) {
            if (option.required === true) {
                throw new Error('Missing argument: --' + optionKey + ' is required');
            }
        }
    }
};

module.exports = Options;
