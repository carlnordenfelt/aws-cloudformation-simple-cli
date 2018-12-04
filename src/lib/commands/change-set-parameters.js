const readFile = require('../read-file');

module.exports = (config, existingStack) => {
    const params = {
        StackName: config.StackName,
        Capabilities: config.Capabilities,
        NotificationARNs: config.NotificationARNs,
        ResourceTypes: config.ResourceTypes,
        Tags: config.Tags,
        Parameters: [],
        ChangeSetName: 'ChangeSet-' + Date.now(),
        ChangeSetType: existingStack ? 'UPDATE' : 'CREATE'
    };

    if (config.OnFailure) {
        params.OnFailure = config.OnFailure;
    } else if (config.DisableRollback) {
        params.DisableRollback = config.DisableRollback;
    }
    if (config.TemplateURL) {
        params.TemplateURL = config.TemplateURL;
    } else if (config.TemplateBody) {
        params.TemplateBody = readFile(config.TemplateBody).toString();
    }

    if (config.StackPolicyURL) {
        params.StackPolicyURL = config.StackPolicyURL;
    } else if (config.StackPolicyBody) {
        params.StackPolicyBody = readFile(config.StackPolicyBody).toString();
    }

    if (config.Parameters) {
        const parameterKeys = Object.keys(config.Parameters);
        parameterKeys.forEach(function (parameterKey) {
            params.Parameters.push({
                ParameterKey: parameterKey,
                ParameterValue: config.Parameters[parameterKey]
            });
        });
    }
    return params;
};
