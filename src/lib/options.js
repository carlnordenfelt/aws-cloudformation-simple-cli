const COMMAND_ARG_POS = 2;
const FIRST_ARG_POS   = 3;
const ARGUMENT_PREFIX = '--';

function Options(args) {
    this.command      = args[COMMAND_ARG_POS];
    this.dryRun       = false;
    this.wait         = true;
    this.forceCleanUp = false;
    this.environment  = undefined;
    this.configFile   = undefined;
    this.placeholders = {};

    for (let i = FIRST_ARG_POS; i < args.length; i = i + 2) {
        const key   = args[i].substring(ARGUMENT_PREFIX.length);
        const value = args[i + 1];
        switch (key) {
            case 'dry-run':
                this.dryRun = value === 'true';
                break;
            case 'wait':
                this.wait = value === 'true';
                break;
            case 'force-clean-up':
                this.forceCleanUp = value === 'true';
                break;
            case 'environment':
                this.environment = value;
                break;
            case 'config-file':
                this.configFile = value;
                break;
            case 'placeholder': {
                const placeHolderParts                 = value.split('=');
                this.placeholders[placeHolderParts[0]] = placeHolderParts[1];
                break;
            }
            default:
                throw new Error('Unknown argument: ' + key);
        }
    }

    this.validate();
    Object.seal(this);
}

Options.getValidCommands = function () {
    return ['update', 'delete', 'help'];
};

Options.getValidLegacyCommands = function () {
    return ['create', 'createOrUpdate'];
};

/* istanbul ignore next */
Options.getValidOptions = function () {
    return {
        'config-file': { description: 'String. Path to local configuration file. Required', required: true },
        'environment': { description: 'String. Environment name for switching between config sets.', required: false },
        'dry-run': { description: 'Boolean. Preview CloudFormation request. Default false', required: false },
        'wait': { description: 'Boolean. Wait for resources to create before continuing. Default true', required: false },
        'force-clean-up': { description: 'Boolean. Remove failed change sets automatically. Default false', required: false },
        'placeholder': { description: 'String array. Placeholders for replacement of values in the config.json file. ' +
            'Syntax: PlaceholderString=ReplacementValue', required: false
        },
    };
};

Options.prototype.getCommand = function () {
    return this.command;
};

Options.prototype.getEnvironment = function () {
    return this.environment;
};

Options.prototype.getConfigFile = function () {
    return this.configFile;
};

Options.prototype.getPlaceholders = function () {
    return this.placeholders;
};

Options.prototype.isDryRun = function () {
    return this.dryRun;
};

Options.prototype.shouldWait = function () {
    return this.wait;
};

Options.prototype.doForceCleanUp = function () {
    return this.forceCleanUp;
};

Options.prototype.validate = function validate() {
    if (!this.command) {
        throw new Error('Missing command argument');
    } else if (Options.getValidCommands().indexOf(this.command) === -1 && Options.getValidLegacyCommands().indexOf(this.command) === -1) {
        throw new Error('Invalid command argument: ' + this.command);
    } else if (!this.configFile && this.command !== 'help') {
        throw new Error('Missing argument: --config-file is required');
    }
};

module.exports = Options;
