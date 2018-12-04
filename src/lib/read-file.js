const fs  = require('fs');
const log = require('log4njs');

module.exports = (filePath) => {
    try {
        fs.accessSync(filePath);
    } catch (error) {
        log.info('File not found or insufficient permissions to read', filePath);
        throw error;
    }
    return fs.readFileSync(filePath).toString();
};
