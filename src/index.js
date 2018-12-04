#! /usr/bin/env node
/* istanbul ignore file */
const log = require('log4njs');

const Options  = require('./lib/options');
const commands = require('./lib/commands');
const usage    = require('./lib/usage');

let providedOptions;
try {
    providedOptions = new Options(process.argv);
} catch (error) {
    log.error('Invalid arguments', error);
    usage();
    process.exit(1);
}

commands(providedOptions)
    .then(response => {
        if (response) {
            log.info('Response', response);
        }
        log.info('Update completed');
    })
    .catch(error => {
        log.error('Error during execution', error);
    });
