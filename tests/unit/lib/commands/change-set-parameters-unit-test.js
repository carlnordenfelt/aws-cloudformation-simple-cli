const expect  = require('chai').expect;
const mockery = require('mockery');
const sinon   = require('sinon');

describe('Change Set Parameters', function () {
    let subject;
    let config;
    const readStub = sinon.stub();

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mockery.registerMock('../read-file', readStub);
        subject = require('../../../../src/lib/commands/change-set-parameters');
    });
    beforeEach(function () {
        readStub.reset();
        readStub.returns(Buffer.from(JSON.stringify({})));

        config = {
            StackName: 'StackName',
            Capabilities: 'Capabilities',
            NotificationARNs: 'NotificationARNs',
            ResourceTypes: 'ResourceTypes',
            Tags: 'Tags',
            Parameters: { Foo: 'Bar' },
            DisableRollback: 'DisableRollback',
            TemplateBody: 'TemplateBody',
            StackPolicyBody: 'StackPolicyBody'
        };
    });

    describe('Default, new stack', function () {
        it('verify', function (done) {
            const result = subject(config, false);
            expect(result.StackName).to.equal('StackName');
            expect(result.Capabilities).to.equal('Capabilities');
            expect(result.NotificationARNs).to.equal('NotificationARNs');
            expect(result.ResourceTypes).to.equal('ResourceTypes');
            expect(result.Tags).to.equal('Tags');
            expect(result.Parameters.length).to.equal(1);
            expect(result.DisableRollback).to.equal('DisableRollback');
            expect(result.TemplateBody).to.equal('{}');
            expect(result.StackPolicyBody).to.equal('{}');
            expect(result.ChangeSetName).to.contain('ChangeSet-');
            expect(result.ChangeSetType).to.equal('CREATE');

            done();
        });
    });
    describe('Default, existing stack', function () {
        it('verify', function (done) {
            const result = subject(config, true);
            expect(result.ChangeSetType).to.equal('UPDATE');

            done();
        });
    });
    describe('Overrides', function () {
        it('verify', function (done) {
            delete config.Parameters;
            config.OnFailure      = 'OnFailure';
            config.StackPolicyURL = 'StackPolicyURL';
            config.TemplateURL    = 'TemplateURL';
            const result          = subject(config, true);
            expect(result.OnFailure).to.equal('OnFailure');
            expect(result.StackPolicyURL).to.equal('StackPolicyURL');
            expect(result.TemplateURL).to.equal('TemplateURL');

            done();
        });
    });
});
