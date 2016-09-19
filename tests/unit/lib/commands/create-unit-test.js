'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var Options = require('../../../../src/lib/options');

describe('create', function () {
    var subject;
    var createStackStub = sinon.stub();
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
                this.createStack = createStackStub;
                this.waitFor = waitForStub;
            }
        };
        var fileHelperMock = {
            read: fileHelperReadStub
        };

        mockery.registerMock('aws-sdk', awsSdkMock);
        mockery.registerMock('../config-reader', configReaderStub);
        mockery.registerMock('../file-helper', fileHelperMock);
        subject = require('../../../../src/lib/commands/create');
    });
    beforeEach(function () {
        createStackStub.reset().resetBehavior();
        createStackStub.yields(null, {});
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
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(createStackStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should succeed without wait', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy', '--wait', 'false']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(createStackStub.calledOnce).to.equal(true);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });
        it('should succeed, dry run only', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy', '--dry-run', 'true']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(createStackStub.called).to.equal(false);
                done();
            });
        });
        it('should fail', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy']);
            createStackStub.yields('createStackStub');
            subject.run(options, function (error) {
                expect(error).to.equal('createStackStub');
                done();
            });
        });
        it('config coverage', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy', '--dry-run', 'true']);
            configReaderStub.returns({ OnFailure: 'OnFailure', TemplateURL: 'TemplateURL', StackPolicyURL: 'StackPolicyURL', Parameters: { Key: 'Value' }});
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(createStackStub.called).to.equal(false);
                done();
            });
        });
        it('config coverage', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'dummy', '--dry-run', 'true']);
            configReaderStub.returns({ DisableRollback: 'DisableRollback', TemplateBody: 'TemplateBody', StackPolicyBody: 'StackPolicyBody' });
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(createStackStub.called).to.equal(false);
                done();
            });
        });
    });
});
