'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe.skip('Index', function () {
    var subject;
    var describeAvailabilityZonesStub;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        describeAvailabilityZonesStub = sinon.stub();

        var ec2Mock = {
            describeAvailabilityZones: describeAvailabilityZonesStub
        };

        mockery.registerMock('./lib/ec2', ec2Mock);
        subject = require('../../src/index');
    });
    beforeEach(function () {
        describeAvailabilityZonesStub.reset().resetBehavior();
        describeAvailabilityZonesStub.yields(null, [{ ZoneName: 'eu-west-1' }]);
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('handler', function () {
        it('should succeed', function (done) {
            subject.handler({}, {}, function (error, asz) {
                expect(error).to.equal(null);
                expect(describeAvailabilityZonesStub.calledOnce).to.equal(true);
                expect(asz.length === 1).to.equal(true);
                done();
            });
        });
        it('should fail due to describe groups error', function (done) {
            describeAvailabilityZonesStub.yields('describeAvailabilityZonesStub');
            subject.handler({}, {}, function (error) {
                expect(error).to.equal('describeAvailabilityZonesStub');
                done();
            });
        });
    });
});
