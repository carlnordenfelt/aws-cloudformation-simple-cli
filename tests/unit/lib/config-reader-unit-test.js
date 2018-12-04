const expect = require('chai').expect;
const mockery = require('mockery');
const sinon = require('sinon');
const Options = require('../../../src/lib/options');

describe('ConfigReader', function () {
    let subject;
    const readStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mockery.registerMock('./read-file', readStub);
        subject = require('../../../src/lib/config-reader');
    });
    beforeEach(function () {
        const config = {
            'default': {
                'StackName': 'DefaultStackName',
                'Parameters': {
                    'MyTemplateParamKey': 'MyTemplateParamValue',
                    'MyOtherTemplateParamKey': 'MyOtherTemplateParamValue'
                },
                'TemplateBody': 'path/to/{ph1}/{ph1}/{ph2}/my-local-cloudformation.template',
                'Capabilities': [
                    'CAPABILITY_IAM'
                ]
            },
            'test': {
                'StackName': 'TestStackName',
                'Parameters': {
                    'MyTemplateParamKey': 'OverrideMyTemplateParamValue'
                },
                'TemplateURL': 'http://s3-bucket-url/cloudformation.template'
            }
        };
        readStub.reset();
        readStub.returns(Buffer.from(JSON.stringify(config)));
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    describe('getConfig', function () {
        it('should succeed with defaults only', function (done) {
            const options = new Options([
                'node', 'script', 'create', '--config-file',
                'path/test.json', '--placeholder', '{ph1}=rh1', '--placeholder', '{ph2}=rh2'
            ]);
            const config = subject(options);
            expect(config.StackName).to.equal('DefaultStackName');
            expect(config.Parameters.MyTemplateParamKey).to.equal('MyTemplateParamValue');
            expect(config.Parameters.MyOtherTemplateParamKey).to.equal('MyOtherTemplateParamValue');
            expect(config.TemplateBody).to.equal('path/to/rh1/rh1/rh2/my-local-cloudformation.template');
            done();
        });
        it('should succeed with environment overrides', function (done) {
            const options = new Options(['node', 'script', 'update', '--environment', 'test', '--config-file', 'path/test.json']);
            const config = subject(options);
            expect(config.StackName).to.equal('TestStackName');
            expect(config.Parameters.MyTemplateParamKey).to.equal('OverrideMyTemplateParamValue');
            expect(config.Parameters.MyOtherTemplateParamKey).to.equal('MyOtherTemplateParamValue');
            expect(config.TemplateURL).to.equal('http://s3-bucket-url/cloudformation.template');
            done();
        });
        it('should succeed with environment overrides only', function (done) {
            readStub.returns(Buffer.from(JSON.stringify({
                'test': {
                    'StackName': 'TestStackName',
                    'Parameters': {
                        'MyTemplateParamKey': 'OverrideMyTemplateParamValue'
                    },
                    'TemplateURL': 'http://s3-bucket-url/cloudformation.template'
                }
            })));
            const options = new Options(['node', 'script', 'update', '--environment', 'test', '--config-file', 'path/test.json']);
            const config = subject(options);
            expect(config.StackName).to.equal('TestStackName');
            expect(config.Parameters.MyTemplateParamKey).to.equal('OverrideMyTemplateParamValue');
            expect(config.Parameters.MyOtherTemplateParamKey).to.equal(undefined);
            expect(config.TemplateURL).to.equal('http://s3-bucket-url/cloudformation.template');
            done();
        });
        it('should fail without environment and no default', function (done) {
            readStub.returns(Buffer.from(JSON.stringify({})));
            function fn() {
                const options = new Options(['node', 'script', 'update', '--config-file', 'path/test.json']);
                subject(options);
            }

            expect(fn).to.throw('No environment provided and no default config in configuration file');
            done();
        });
        it('should fail with invalid  environment', function (done) {
            function fn() {
                const options = new Options(['node', 'script', 'update', '--environment', 'test2', '--config-file', 'path/test.json']);
                subject(options);
            }

            expect(fn).to.throw('Environment not defined in config file');
            done();
        });
        it('should fail if provided config is not valid JSON', function (done) {
            readStub.throws(new Error('Bad JSON'));
            function fn() {
                const options = new Options(['node', 'script', 'update', '--config-file', 'path/test.json']);
                subject(options);
            }

            expect(fn).to.throw('Bad JSON');
            done();
        });
    });
});
