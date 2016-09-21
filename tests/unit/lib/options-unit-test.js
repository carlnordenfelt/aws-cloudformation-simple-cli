'use strict';

var expect = require('chai').expect;

describe('Options', function () {
    var subject;

    before(function () {
        subject = require('../../../src/lib/options');
    });
    describe('Parse options', function () {
        it('should succeed', function (done) {
            var options = new subject([
                'node', 'script', 'create', '--dry-run', 'true', '--wait', 'false', '--environment',
                'test', '--config-file', 'path/test.json', '--placeholder', 'ph1=rp1', '--placeholder', 'ph2=rp2'
            ]);
            expect(options.getCommand()).to.equal('create');
            expect(options.isDryRun()).to.equal(true);
            expect(options.shouldWait()).to.equal(false);
            expect(options.getEnvironment()).to.equal('test');
            expect(options.getConfigFile()).to.equal('path/test.json');
            expect(Object.keys(options.getPlaceholders()).length).to.equal(2);
            expect(options.getPlaceholders().ph1).to.equal('rp1');
            expect(options.getPlaceholders().ph2).to.equal('rp2');
            done();
        });
        it('should fail on missing command', function (done) {
            function fn () {
                new subject(['node', 'script']);
            }
            expect(fn).to.throw('Missing command argument');
            done();
        });
        it('should fail on invalid property invalid parameter (dry-run)', function (done) {
            function fn () {
                new subject(['node', 'script', 'create', '--dryrun', 'true']);
            }
            expect(fn).to.throw('Unknown argument');
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
                new subject(['node', 'script', 'create']);
            }

            expect(fn).to.throw('--config-file is required');
            done();
        });
    });
});
