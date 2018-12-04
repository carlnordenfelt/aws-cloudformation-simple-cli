const expect  = require('chai').expect;
const mockery = require('mockery');
const sinon   = require('sinon');
const Options = require('../../../../src/lib/options');

describe('Delete', function () {
    let subject;
    const deleteStackStub  = sinon.stub();
    const waitForStub      = sinon.stub();
    const readStub         = sinon.stub();
    const configReaderStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        const awsSdkMock = {
            CloudFormation: function () {
                this.deleteStack = deleteStackStub;
                this.waitFor     = waitForStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkMock);
        mockery.registerMock('../config-reader', configReaderStub);
        mockery.registerMock('../read-file', readStub);
        subject = require('../../../../src/lib/commands/delete');
    });
    beforeEach(function () {
        deleteStackStub.reset();
        deleteStackStub.returns({
            promise: () => {
                return {};
            }
        });

        waitForStub.reset();
        waitForStub.returns({
            promise: () => {
                return {};
            }
        });

        readStub.reset();
        readStub.returns(JSON.stringify({}));

        configReaderStub.reset();
        configReaderStub.returns({});
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('run', function () {
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                expect(deleteStackStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should succeed without wait', function (done) {
            const options = new Options(['node', 'script', 'delete', '--config-file', 'dummy', '--wait', 'false']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                expect(deleteStackStub.calledOnce).to.equal(true);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });
        it('should succeed, dry run only', function (done) {
            const options = new Options(['node', 'script', 'delete', '--config-file', 'dummy', '--dry-run', 'true']);
            subject(options).then(result => {
                expect(result).to.equal(undefined);
                expect(deleteStackStub.called).to.equal(false);
                done();
            });
        });
        it('should fail', function (done) {
            deleteStackStub.returns({
                promise: () => {
                    throw new Error('deleteStackStub');
                }
            });
            const options = new Options(['node', 'script', 'delete', '--config-file', 'dummy']);
            subject(options).catch(error => {
                expect(error.message).to.equal('deleteStackStub');
                done();
            });
        });
    });
});
