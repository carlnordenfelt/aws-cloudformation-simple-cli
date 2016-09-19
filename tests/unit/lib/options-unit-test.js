'use strict';

var expect = require('chai').expect;

describe('Options', function () {
    var subject;

    before(function () {
        subject = require('../../../src/lib/options');
    });
    describe('Parse options', function () {
        it('should succeed', function (done) {
            var options = new subject(['node', 'script', 'create', '--dry-run', 'true', '--wait', 'false', '--environment', 'test', '--config-file', 'path/test.json']);
            expect(options.getCommand()).to.equal('create');
            expect(options.isDryRun()).to.equal(true);
            expect(options.shouldWait()).to.equal(false);
            expect(options.getEnvironment()).to.equal('test');
            expect(options.get('config-file')).to.equal('path/test.json');
            done();
        });
        it('should ignore invalid parameter (dry-run)', function (done) {
            var options = new subject(['node', 'script', 'create', 'dry-run', 'true', '--wait', 'false', '--environment', 'test', '--config-file', 'path/test.json']);
            expect(options.getCommand()).to.equal('create');
            expect(options.isDryRun()).to.equal(false);
            expect(options.shouldWait()).to.equal(false);
            expect(options.getEnvironment()).to.equal('test');
            expect(options.get('config-file')).to.equal('path/test.json');
            done();
        });
    });

    describe('Validate', function () {
        it('should succeed', function (done) {
            var options = new subject(['node', 'script', 'create', '--dry-run', 'true', '--wait', 'false', '--environment', 'test', '--config-file', 'path/test.json']);
            options.validate();
            done();
        });
        it('should fail due to missing required attribute', function (done) {
            function fn() {
                var options = new subject(['node', 'script', 'create']);
                options.validate();
            }
            expect(fn).to.throw('--config-file is required');
            done();
        });
    });
});
