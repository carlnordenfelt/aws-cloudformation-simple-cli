'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var Options = require('../../../src/lib/options');

describe('ConfigReader', function () {
    var subject;
    var readStub;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        readStub = sinon.stub();

        var fileHelperMock = {
            read: readStub
        };

        mockery.registerMock('./file-helper', fileHelperMock);
        subject = require('../../../src/lib/config-reader');
    });
    beforeEach(function () {
        var config = {
            'default': {
                'StackName': 'DefaultStackName',
                'Parameters': {
                    'MyTemplateParamKey': 'MyTemplateParamValue',
                    'MyOtherTemplateParamKey': 'MyOtherTemplateParamValue'
                },
                'TemplateBody': 'path/to/my-local-cloudformation.template',
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
        readStub.reset().resetBehavior();
        readStub.returns(new Buffer(JSON.stringify(config)));
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });
    describe('getConfig', function () {
        it('should succeed with defaults only', function (done) {
            var options = new Options(['node', 'script', 'create', '--config-file', 'path/test.json']);
            var config = subject(options);
            expect(config.StackName).to.equal('DefaultStackName');
            expect(config.Parameters.MyTemplateParamKey).to.equal('MyTemplateParamValue');
            expect(config.Parameters.MyOtherTemplateParamKey).to.equal('MyOtherTemplateParamValue');
            expect(config.TemplateBody).to.equal('path/to/my-local-cloudformation.template');
            done();
        });
        it('should succeed with environment overrides', function (done) {
            var options = new Options(['node', 'script', 'create', '--environment', 'test', '--config-file', 'path/test.json']);
            var config = subject(options);
            expect(config.StackName).to.equal('TestStackName');
            expect(config.Parameters.MyTemplateParamKey).to.equal('OverrideMyTemplateParamValue');
            expect(config.Parameters.MyOtherTemplateParamKey).to.equal('MyOtherTemplateParamValue');
            expect(config.TemplateURL).to.equal('http://s3-bucket-url/cloudformation.template');
            done();
        });
        it('should succeed with environment overrides only', function (done) {
            readStub.returns(new Buffer(JSON.stringify({
                'test': {
                    'StackName': 'TestStackName',
                    'Parameters': {
                        'MyTemplateParamKey': 'OverrideMyTemplateParamValue'
                    },
                    'TemplateURL': 'http://s3-bucket-url/cloudformation.template'
                }
            })));
            var options = new Options(['node', 'script', 'create', '--environment', 'test', '--config-file', 'path/test.json']);
            var config = subject(options);
            expect(config.StackName).to.equal('TestStackName');
            expect(config.Parameters.MyTemplateParamKey).to.equal('OverrideMyTemplateParamValue');
            expect(config.Parameters.MyOtherTemplateParamKey).to.equal(undefined);
            expect(config.TemplateURL).to.equal('http://s3-bucket-url/cloudformation.template');
            done();
        });
        it('should fail without environment and no default', function (done) {
            readStub.returns(new Buffer(JSON.stringify({})));
            function fn() {
                var options = new Options(['node', 'script', 'create', '--config-file', 'path/test.json']);
                subject(options);
            }

            expect(fn).to.throw('No environment provided and no default config in configuration file');
            done();
        });
        it('should fail with invalid  environment', function (done) {
            function fn() {
                var options = new Options(['node', 'script', 'create', '--environment', 'test2', '--config-file', 'path/test.json']);
                subject(options);
            }

            expect(fn).to.throw('Environment not defined in config file');
            done();
        });
    });
});
