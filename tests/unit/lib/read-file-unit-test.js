const expect  = require('chai').expect;
const mockery = require('mockery');
const sinon   = require('sinon');

describe('FileHelper', function () {
    let subject;
    const accessSyncStub   = sinon.stub();
    const readFileSyncStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        const fsStub = {
            accessSync: accessSyncStub,
            readFileSync: readFileSyncStub
        };

        mockery.registerMock('fs', fsStub);
        subject = require('../../../src/lib/read-file');
    });
    beforeEach(function () {
        accessSyncStub.reset();
        accessSyncStub.returns();
        readFileSyncStub.reset();
        readFileSyncStub.returns(Buffer.from('a string'));
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('read', function () {
        it('should succeed', function (done) {
            const contents = subject('file');
            expect(contents).to.equal('a string');
            done();
        });
        it('should fail', function (done) {
            accessSyncStub.throws(new Error('accessSyncStub'));

            function fn() {
                subject('file');
            }

            expect(fn).to.throw('accessSyncStub');
            done();
        });
    });
});
