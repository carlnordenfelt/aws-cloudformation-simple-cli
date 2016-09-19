'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var Options = require('../../../src/lib/options');

describe('Commands', function () {
    var subject;
    var runStub;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        runStub = sinon.stub();

        var commandMock = {
            run: runStub
        };

        mockery.registerMock('./commands/create', commandMock);
        mockery.registerMock('./commands/update', commandMock);
        mockery.registerMock('./commands/delete', commandMock);
        subject = require('../../../src/lib/commands');
    });
    beforeEach(function () {
        runStub.reset().resetBehavior();
        runStub.yields(null, {});
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('create', function () {
        it('should succeed', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                done();
            });
        });
        it('should fail due to run error', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy']);
            runStub.yields('RunError');
            subject.run(options, function (error, result) {
                expect(error).to.equal('RunError');
                expect(result).to.equal(undefined);
                done();
            });
        });
        it('should fail if validation fails', function (done) {
            var options = new Options(['node', 'script', 'create']);
            subject.run(options, function (error, result) {
                expect(error.message).to.contain('Missing argument');
                expect(result).to.equal(undefined);
                done();
            });
        });
    });

    describe('update', function () {
        it('should succeed', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                done();
            });
        });
        it('should fail due to run error', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            runStub.yields('RunError');
            subject.run(options, function (error, result) {
                expect(error).to.equal('RunError');
                expect(result).to.equal(undefined);
                done();
            });
        });
        it('should fail if validation fails', function (done) {
            var options = new Options(['node', 'script', 'update']);
            subject.run(options, function (error, result) {
                expect(error.message).to.contain('Missing argument');
                expect(result).to.equal(undefined);
                done();
            });
        });
    });

    describe('delete', function () {
        it('should succeed', function (done) {
            var options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                done();
            });
        });
        it('should fail due to run error', function (done) {
            var options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            runStub.yields('RunError');
            subject.run(options, function (error, result) {
                expect(error).to.equal('RunError');
                expect(result).to.equal(undefined);
                done();
            });
        });
        it('should fail if validation fails', function (done) {
            var options = new Options(['node', 'script', 'delete']);
            subject.run(options, function (error, result) {
                expect(error.message).to.contain('Missing argument');
                expect(result).to.equal(undefined);
                done();
            });
        });
    });

    describe('invalid command', function () {
        it('should fail on help', function (done) {
            var options = new Options(['node', 'script', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error.command).to.equal('help');
                expect(result).to.equal(undefined);
                done();
            });
        });
    });
});
