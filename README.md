# aws-simple-installer
Command line tool for creating, updating and deleting AWS projects created via CloudFormation.

#Usage

    npm install -g aws-simple-installer
    aws-cfn-si create --config-file path/to/local-config-file.json [--dry-run true --wait false --environmet test]
    aws-cfn-si update --config-file path/to/local-config-file.json [--dry-run true --wait false --environmet test]
    aws-cfn-si delete --config-file path/to/local-config-file.json [--dry-run true --wait false --environmet test]

## Command line options

* `--dry-run`: Set to true if you want to preview the CloudFormation request. Default is `false`.
* `--wait`: Set to true if you want the client to wait for the operation to complete before returning. Default is `true`.
* `--environment` Switch between environments in the local config file. See [Configuration](#Configuration) for more details. Default is `none`.

## Configuration
The local configuration file describes all CloudFormation request parameters.
It expects either at least one environment to be defined or a default configuration set.

If an environment is provided and there is a default config st, any settings not defined under the environment
will be merged with the default set. The environment setting takes precedence.

### Example

    {
        "default": {
            "StackName": "DefaultStackName",
            "Parameters": {
                "MyTemplateParamKey": "MyTemplateParamValue",
                "MyOtherTemplateParamKey": "MyOtherTemplateParamValue"
            },
            "TemplateBody": "path/to/my-local-cloudformation.template",
            "Capabilities": [
                "CAPABILITY_IAM"
            ]
        },
        "test": {
            "StackName": "TestStackName",
            "Parameters": {
                "MyTemplateParamKey": "OverrideMyTemplateParamValue"
            },
            "TemplateURL": "http://s3-bucket-url/cloudformation.template"
        }
    }

Some CloudFormation request params are expected to be "one of".
These params, and which takes precedence if both are provided are listed below.

* `StackPolicyURL` & `StackPolicyBody`. `StackPolicyURL` takes precedence.
* `StackPolicyDuringUpdateURL` & `StackPolicyDuringUpdateBody`. `StackPolicyDuringUpdateURL` takes precedence.
* `TemplateURL` & `TemplateBody`. `TemplateURL` takes precedence.
* `OnFailure` & `DisableRollback`. `OnFailure` takes precedence.
