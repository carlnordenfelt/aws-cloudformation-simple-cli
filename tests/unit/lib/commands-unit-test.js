const expect  = require('chai').expect;
const mockery = require('mockery');
const sinon   = require('sinon');
const Options = require('../../../src/lib/options');

describe('Commands', function () {
    let subject;
    let commandStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mockery.registerMock('./commands/create-change-set', commandStub);
        mockery.registerMock('./commands/delete', commandStub);
        subject = require('../../../src/lib/commands');
    });
    beforeEach(function () {
        commandStub.reset();
        commandStub.returns({});
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('update', function () {
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                done();
            });
        });
        it('should fail due to run error', function (done) {
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            commandStub.throws(new Error('foobar'));
            subject(options).catch(error => {
                expect(error.message).to.equal('foobar');
                done();
            });
        });
    });

    describe('delete', function () {
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                done();
            });
        });
        it('should fail due to run error', function (done) {
            const options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            commandStub.throws(new Error('foobar'));
            subject(options).catch(error => {
                expect(error.message).to.equal('foobar');
                done();
            });
        });
    });

    describe('help', function () {
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'help', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.equal(undefined);
                done();
            });
        });
    });
});
