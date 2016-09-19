'use strict';

var fs = require('fs');

var pub = {};

pub.read = function read(file) {
    try {
        fs.accessSync(file);
    } catch (error) {
        console.log('File not be found or insufficient permissions to read', file);
        throw error;
    }
    return fs.readFileSync(file).toString();
};

module.exports = pub;
