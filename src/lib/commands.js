'use strict';

var createStack = require('./commands/create');
var updateStack = require('./commands/update');
var deleteStack = require('./commands/delete');
var pub = {};

pub.run = function run(options, callback) {
    switch (options.getCommand()) {
        case 'create':
            createStack.run(options, callback);
            break;
        case 'update':
            updateStack.run(options, callback);
            break;
        case 'delete':
            deleteStack.run(options, callback);
            break;
        case 'help':
            callback({});
            break;
    }
};

module.exports = pub;
