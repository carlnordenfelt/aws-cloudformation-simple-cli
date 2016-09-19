'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var Options = require('../../../../src/lib/options');

describe('Delete', function () {
    var subject;
    var deleteStackStub = sinon.stub();
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
                this.deleteStack = deleteStackStub;
                this.waitFor = waitForStub;
            }
        };
        var fileHelperMock = {
            read: fileHelperReadStub
        };

        mockery.registerMock('aws-sdk', awsSdkMock);
        mockery.registerMock('../config-reader', configReaderStub);
        mockery.registerMock('../file-helper', fileHelperMock);
        subject = require('../../../../src/lib/commands/delete');
    });
    beforeEach(function () {
        deleteStackStub.reset().resetBehavior();
        deleteStackStub.yields(null, {});
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
            var options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(deleteStackStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should succeed without wait', function (done) {
            var options = new Options(['node', 'script', 'delete', '--config-file', 'dummy', '--wait', 'false']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(deleteStackStub.calledOnce).to.equal(true);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });
        it('should succeed, dry run only', function (done) {
            var options = new Options(['node', 'script', 'delete', '--config-file', 'dummy', '--dry-run', 'true']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.equal(null);
                expect(deleteStackStub.called).to.equal(false);
                done();
            });
        });
        it('should fail', function (done) {
            var options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            deleteStackStub.yields('deleteStackStub');
            subject.run(options, function (error) {
                expect(error).to.equal('deleteStackStub');
                done();
            });
        });
    });
});
