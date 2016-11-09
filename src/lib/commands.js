'use strict';

var createOrUpdateStack = require('./commands/create-or-update');
var createStack = require('./commands/create');
var updateStack = require('./commands/update');
var deleteStack = require('./commands/delete');
var pub = {};

pub.run = function run(options, callback) {
    switch (options.getCommand()) {
        case 'createOrUpdate':
            createOrUpdateStack.run(options, callback);
            break;
        case 'create':
            createStack.run(options, callback);
            break;
        case 'update':
            updateStack.run(options, callback);
            break;
        case 'delete':
            deleteStack.run(options, callback);
            break;
        default:
            callback({});
            break;
    }
};

module.exports = pub;
