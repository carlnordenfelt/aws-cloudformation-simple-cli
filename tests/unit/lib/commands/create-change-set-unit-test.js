const expect  = require('chai').expect;
const mockery = require('mockery');
const sinon   = require('sinon');
const Options = require('../../../../src/lib/options');

describe('Change Set', function () {
    let subject;
    const createChangeSetStub   = sinon.stub();
    const executeChangeSetStub  = sinon.stub();
    const describeChangeSetStub = sinon.stub();
    const deleteChangeSetStub   = sinon.stub();
    const describeStacksStub    = sinon.stub();
    const validateTemplateStub  = sinon.stub();
    const waitForStub           = sinon.stub();
    const fileHelperReadStub    = sinon.stub();
    const configReaderStub      = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        const awsMock        = {
            CloudFormation: function () {
                this.createChangeSet   = createChangeSetStub;
                this.executeChangeSet  = executeChangeSetStub;
                this.describeChangeSet = describeChangeSetStub;
                this.deleteChangeSet   = deleteChangeSetStub;
                this.describeStacks    = describeStacksStub;
                this.validateTemplate  = validateTemplateStub;
                this.waitFor           = waitForStub;
            }
        };
        const fileHelperMock = {
            read: fileHelperReadStub
        };

        mockery.registerMock('aws-sdk', awsMock);
        mockery.registerMock('../config-reader', configReaderStub);
        mockery.registerMock('../file-helper', fileHelperMock);
        subject = require('../../../../src/lib/commands/create-change-set');
    });
    beforeEach(function () {
        createChangeSetStub.reset();
        createChangeSetStub.returns({
            promise: () => {
                return { Id: 'ChangeSetId' };
            }
        });

        executeChangeSetStub.reset();
        executeChangeSetStub.returns({
            promise: () => {
                return { foo: 'bar' };
            }
        });

        describeChangeSetStub.reset();
        describeChangeSetStub.returns({
            promise: () => {
                return {
                    Status: 'FAILED',
                    StatusReason: 'didn\'t contain changes'
                };
            }
        });

        deleteChangeSetStub.reset();
        deleteChangeSetStub.returns({
            promise: () => {
                return { foo: 'bar' };
            }
        });

        describeStacksStub.reset();
        describeStacksStub.returns({
            promise: () => {
                return { foo: 'bar' };
            }
        });

        validateTemplateStub.reset();
        validateTemplateStub.returns({
            promise: () => {
                return { foo: 'bar' };
            }
        });

        waitForStub.reset();
        waitForStub.returns({
            promise: () => {
                return { foo: 'bar' };
            }
        });

        fileHelperReadStub.reset();
        fileHelperReadStub.returns(JSON.stringify({}));

        configReaderStub.reset();
        configReaderStub.returns({});
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('Dry run', function () {
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--dry-run', 'true']);
            subject(options).then(result => {
                expect(result).to.equal(undefined);
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.called).to.equal(false);
                expect(executeChangeSetStub.called).to.equal(false);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });

        it('should fail on describe stacks error', function (done) {
            describeStacksStub.returns({
                promise: () => {
                    throw new Error('DescribeStacksError');
                }
            });
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--dry-run', 'true']);
            subject(options).catch(error => {
                expect(error.message).to.equal('DescribeStacksError');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.called).to.equal(false);
                expect(createChangeSetStub.called).to.equal(false);
                expect(executeChangeSetStub.called).to.equal(false);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });

        it('should fail on template validation error using template body', function (done) {
            validateTemplateStub.returns({
                promise: () => {
                    throw new Error('ValidationError');
                }
            });
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--dry-run', 'true']);
            subject(options).catch(error => {
                expect(error.message).to.equal('ValidationError');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.called).to.equal(false);
                expect(executeChangeSetStub.called).to.equal(false);
                expect(waitForStub.called).to.equal(false);
                done();
            });
        });
    });

    describe('Create new Stack', function () {
        beforeEach(function() {
            describeStacksStub.reset();
            describeStacksStub.returns({
                promise: () => {
                    throw new Error('Stack does not exist');
                }
            });
        });
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(executeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledTwice).to.equal(true);
                done();
            });
        });
        it('should succeed when not waiting', function (done) {
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--wait', 'false']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(executeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                done();
            });
        });
    });

    describe('Update Stack', function () {
        it('should succeed', function (done) {
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.be.an('object');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(executeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledTwice).to.equal(true);
                done();
            });
        });
    });

    describe('ChangeSet creation error', function () {
        it('should clean up if change set contains no changes', function (done) {
            waitForStub.returns({
                promise: () => {
                    throw new Error('Error');
                }
            });
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.equal(undefined);
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(describeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                expect(deleteChangeSetStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should clean up if change set contains no changes - part 2', function (done) {
            waitForStub.returns({
                promise: () => {
                    throw new Error('Error');
                }
            });
            describeChangeSetStub.returns({
                promise: () => {
                    return {
                        Status: 'FAILED',
                        StatusReason: 'No updates are to be performed'
                    };
                }
            });
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject(options).then(result => {
                expect(result).to.equal(undefined);
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(describeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                expect(deleteChangeSetStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should clean up if force-clean-up is set', function (done) {
            waitForStub.returns({
                promise: () => {
                    throw new Error('Error');
                }
            });
            describeChangeSetStub.returns({
                promise: () => {
                    return {
                        Status: 'FAILED',
                        StatusReason: 'Some other reason'
                    };
                }
            });
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy', '--force-clean-up', 'true']);
            subject(options).then(result => {
                expect(result).to.equal(undefined);
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(describeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                expect(deleteChangeSetStub.calledOnce).to.equal(true);
                done();
            });
        });
        it('should fail if other error', function (done) {
            waitForStub.returns({
                promise: () => {
                    throw new Error('Error');
                }
            });
            describeChangeSetStub.returns({
                promise: () => {
                    return {
                        Status: 'FAILED',
                        StatusReason: 'Some other reason'
                    };
                }
            });
            const options = new Options(['node', 'script', 'update', '--config-file', 'dummy']);
            subject(options).catch(error => {
                expect(error.message).to.contain('ChangeSet creation failed:');
                expect(describeStacksStub.calledOnce).to.equal(true);
                expect(validateTemplateStub.calledOnce).to.equal(true);
                expect(createChangeSetStub.calledOnce).to.equal(true);
                expect(describeChangeSetStub.calledOnce).to.equal(true);
                expect(waitForStub.calledOnce).to.equal(true);
                expect(deleteChangeSetStub.called).to.equal(false);
                done();
            });
        });
    });
});
