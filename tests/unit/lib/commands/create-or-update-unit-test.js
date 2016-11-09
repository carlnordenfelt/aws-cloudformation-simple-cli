'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var Options = require('../../../../src/lib/options');

describe('Update', function () {
    var subject;
    var describeStacksStub = sinon.stub();
    var createStub = sinon.stub();
    var updateStub = sinon.stub();
    var configReaderStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var awsSdkMock = {
            CloudFormation: function () {
                this.describeStacks = describeStacksStub;
                this.waitFor = updateStub;
            }
        };

        var createMock = {
            run: createStub
        };
        var updateMock = {
            run: updateStub
        };

        mockery.registerMock('aws-sdk', awsSdkMock);
        mockery.registerMock('../config-reader', configReaderStub);
        mockery.registerMock('./create', createMock);
        mockery.registerMock('./update', updateMock);
        subject = require('../../../../src/lib/commands/create-or-update');
    });
    beforeEach(function () {
        describeStacksStub.reset().resetBehavior();
        describeStacksStub.yields(null, { Stacks: [{}]});
        createStub.reset().resetBehavior();
        createStub.yields(null, {});
        updateStub.reset().resetBehavior();
        updateStub.yields(null, {});
        configReaderStub.reset().resetBehavior();
        configReaderStub.returns({});
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('run', function () {
        it('should update stack', function (done) {
            var options = new Options(['node', 'script', 'createOrUpdate', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(createStub.called).to.equal(false);
                expect(updateStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should create stack', function (done) {
            describeStacksStub.yields(new Error('Stack does not exist'));
            var options = new Options(['node', 'script', 'createOrUpdate', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error).to.equal(null);
                expect(result).to.be.an('object');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(createStub.calledOnce).to.equal(true);
                expect(updateStub.called).to.equal(false);
                done();
            });
        });
        it('should fail on describe stack error stack', function (done) {
            describeStacksStub.yields(new Error('describeStacksStub'));
            var options = new Options(['node', 'script', 'createOrUpdate', '--config-file', 'dummy']);
            subject.run(options, function (error, result) {
                expect(error.message).to.equal('describeStacksStub');
                expect(result).to.equal(undefined);
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(createStub.called).to.equal(false);
                expect(updateStub.called).to.equal(false);
                done();
            });
        });
    });
});
