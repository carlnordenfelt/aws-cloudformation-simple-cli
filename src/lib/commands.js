'use strict';

var createStack = require('./commands/create');
var updateStack = require('./commands/update');
var deleteStack = require('./commands/delete');
var pub = {};

pub.run = function run(options, callback) {
    switch (options.getCommand()) {
        case 'create':
            try {
                options.validate(createStack.options);
                createStack.run(options, callback);
            } catch (error) {
                error.command = 'create';
                callback(error);
            }
            break;
        case 'update':
            try {
                options.validate(updateStack.options);
                updateStack.run(options, callback);
            } catch (error) {
                error.command = 'update';
                callback(error);
            }
            break;
        case 'delete':
            try {
                options.validate(deleteStack.options);
                deleteStack.run(options, callback);
            } catch (error) {
                error.command = 'delete';
                callback(error);
            }
            break;
        default:
            callback({ message: 'Invalid command given. Must be one of create, update or delete', command: 'help' });
            break;
    }
};

module.exports = pub;
