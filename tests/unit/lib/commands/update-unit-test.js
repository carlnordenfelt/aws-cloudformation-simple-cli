'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var Options = require('../../../../src/lib/options');

describe('Update', function () {
    var subject;
    var updateStackStub = sinon.stub();
    var waitForStub = sinon.stub();
    var fileHelperReadStub = sinon.stub();
    var configReaderStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var awsSdkMock = {
            CloudFormation: function () {
                this.updateStack = updateStackStub;
                this.waitFor = waitForStub;
            }
        };
        var fileHelperMock = {
            read: fileHelperReadStub
        };

        mockery.registerMock('aws-sdk', awsSdkMock);
        mockery.registerMock('../config-reader', configReaderStub);
        mockery.registerMock('../file-helper', fileHelperMock);
        subject = require('../../../../src/lib/commands/update');
    });
    beforeEach(function () {
        updateStackStub.reset().resetBehavior();
        updateStackStub.yields(null, {});
        waitForStub.reset().resetBehavior();
        waitForStub.yields(null, {});
        fileHelperReadStub.reset().resetBehavior();
        fileHelperReadStub.returns(JSON.stringify({}));
        configReaderStub.reset().resetBehavior();
        configReaderStub.returns({});
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('run', function () {
        it('should succeed', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(updateStackStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should succeed without wait', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--wait', 'false']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(updateStackStub.calledOnce).to.equal(true);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });
        it('should succeed, dry run only', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--dry-run', 'true']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(updateStackStub.called).to.equal(false);
                done();
            });
        });
        it('should fail', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            updateStackStub.yields('updateStackStub');
            subject.run(options, function (error) {
                expect(error).to.equal('updateStackStub');
                done();
            });
        });
        it('should not fail', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            updateStackStub.yields({ message: 'No updates are to be performed.' });
            subject.run(options, function (error) {
                expect(error).to.equal(null);
                done();
            });
        });
        it('config coverage', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--dry-run', 'true']);
            configReaderStub.returns({
                TemplateURL: 'TemplateURL',
                StackPolicyURL: 'StackPolicyURL',
                StackPolicyDuringUpdateURL: 'StackPolicyDuringUpdateURL',
                Parameters: { Key: 'Value' }
            });
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(updateStackStub.called).to.equal(false);
                done();
            });
        });
        it('config coverage', function (done) {
            var options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--dry-run', 'true']);
            configReaderStub.returns({
                TemplateBody: 'TemplateBody',
                StackPolicyBody: 'StackPolicyBody',
                StackPolicyDuringUpdateBody: 'StackPolicyDuringUpdateBody'
            });
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(updateStackStub.called).to.equal(false);
                done();
            });
        });
    });
});
