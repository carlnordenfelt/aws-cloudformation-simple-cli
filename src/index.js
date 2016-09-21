#! /usr/bin/env node
'use strict';

/* istanbul ignore next */
var Options = require('./lib/Options');
/* istanbul ignore next */
var commands = require('./lib/commands');
/* istanbul ignore next */
var usage = require('./lib/usage');

/* istanbul ignore next */
var providedOptions;
/* istanbul ignore next */
try {
    providedOptions= new Options(process.argv);
} catch (error) {
    usage(error);
}
/* istanbul ignore next */
commands.run(providedOptions, function (error, response) {
    if (error) {
        usage(error);
    } else {
        console.log('[Response]', response);
    }
});
