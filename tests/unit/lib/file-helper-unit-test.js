'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('FileHelper', function () {
    var subject;
    var accessSyncStub;
    var readFileSyncStub;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        accessSyncStub = sinon.stub();
        readFileSyncStub = sinon.stub();

        var fsStub = {
            accessSync: accessSyncStub,
            readFileSync: readFileSyncStub
        };

        mockery.registerMock('fs', fsStub);
        subject = require('../../../src/lib/file-helper');
    });
    beforeEach(function () {
        accessSyncStub.reset().resetBehavior();
        accessSyncStub.returns();
        readFileSyncStub.reset().resetBehavior();
        readFileSyncStub.returns(new Buffer('a string'));
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('read', function () {
        it('should succeed', function (done) {
            var contents = subject.read('file');
            expect(contents).to.equal('a string');
            done();
        });
        it('should fail', function (done) {
            accessSyncStub.throws(new Error('accessSyncStub'));
            function fn() {
                subject.read('file');
            }
            expect(fn).to.throw('accessSyncStub');
            done();
        });
    });
});
