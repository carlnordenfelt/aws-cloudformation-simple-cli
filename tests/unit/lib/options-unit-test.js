const expect = require('chai').expect;

describe('Options', function () {
    let subject;

    before(function () {
        subject = require('../../../src/lib/options');
    });
    describe('Parse options', function () {
        it('should succeed', function (done) {
            const options = new subject([
                'node', 'script', 'create',
                '--dry-run', 'true',
                '--wait', 'false',
                '--force-clean-up', 'true',
                '--environment', 'test',
                '--config-file', 'path/test.json',
                '--placeholder', 'ph1=rp1',
                '--placeholder', 'ph2=rp2'
            ]);
            expect(options.getCommand()).to.equal('create');
            expect(options.isDryRun()).to.equal(true);
            expect(options.shouldWait()).to.equal(false);
            expect(options.doForceCleanUp()).to.equal(true);
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
        it('should fail on invalid command', function (done) {
            function fn () {
                new subject(['node', 'script',' invalid']);
            }
            expect(fn).to.throw('Invalid command argument');
            done();
        });
        it('should fail on missing config-file argument', function (done) {
            function fn () {
                new subject(['node', 'script', 'create']);
            }
            expect(fn).to.throw('Missing argument: --config-file is required');
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
});
