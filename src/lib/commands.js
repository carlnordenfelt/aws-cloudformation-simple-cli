const createChangeSet = require('./commands/create-change-set');
const deleteStack     = require('./commands/delete');
const usage           = require('./usage');

/* eslint-disable no-fallthrough */
module.exports = async function (options) {
    switch (options.getCommand()) {
        /*istanbul ignore next */
        case 'create':
        /*istanbul ignore next */
        case 'createOrUpdate':
        case 'update':
            return await createChangeSet(options);
        case 'delete':
            return await deleteStack(options);
        case 'help':
            return usage();
        default:
            throw new Error('Invalid command provided: ' + options.getCommand());
    }
};
