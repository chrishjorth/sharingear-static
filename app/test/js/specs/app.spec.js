/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var chai = require('chai'),
	$ = require('jquery'),
    GoogleMaps = require('../../../js/libraries/mscl-googlemaps.js'),

	App = require('../../../js/app.js'),

	expect;

expect = chai.expect;

require('script!../../../node_modules/sinon/pkg/sinon.js');

describe('App', function() {
    beforeEach(function() {
        this.$fixtures = $('#fixtures');
        this.$fixtures.html('<div class="navigation-header"></div><div class="footer"></div>');
        this.loginStatusSpy = sinon.stub(App.user, 'getLoginStatus', function(callback) {
            callback({
                status: null //We simulate the situation of a user that is not logged in. The initialization of Sharingear is the same anyhow for this module.
            });
        });
        this.setUserLocationSpy = sinon.spy(App, 'setUserLocation');
        this.GoogleMapsLoadStub = sinon.stub(GoogleMaps, 'load', function() {});
    });

    afterEach(function() {
        App.user.getLoginStatus.restore();
        App.setUserLocation.restore();
        this.$fixtures.empty();
        GoogleMaps.load.restore();
    });

    it('Provides the app object', function() {
        expect(App).to.be.an('object');
        expect(App.run).to.be.a('function');
    });

    it('Can initialize Sharingear', function(done) {
        var spec = this;
        App.run(function() {
            expect(App.router).to.be.an('object');
            expect(App.router.routes).to.be.an('array');
            expect(App.user).to.be.an('object');
            sinon.assert.calledOnce(spec.loginStatusSpy);
            expect(App.contentClassification).to.be.an('object');
            sinon.assert.calledOnce(spec.setUserLocationSpy);
            done();
        });
    });

    it('Has correct routes', function() {
        var router = App.router;
        expect(router.routeExists('home')).to.equal(true);
        expect(router.routeExists('dashboard')).to.equal(true);
        expect(router.routeExists('dashboard/profile')).to.equal(true);
        expect(router.routeExists('dashboard/yourgear')).to.equal(true);
        expect(router.routeExists('dashboard/yourgearrentals')).to.equal(true);
        expect(router.routeExists('dashboard/yourgearreservations')).to.equal(true);
        expect(router.routeExists('dashboard/settings')).to.equal(true);
        expect(router.routeExists('gearprofile')).to.equal(true);
        expect(router.routeExists('aboutus')).to.equal(true);
        expect(router.routeExists('contactus')).to.equal(true);
        expect(router.routeExists('terms')).to.equal(true);
        expect(router.routeExists('copyright')).to.equal(true);
        expect(router.routeExists('privacy')).to.equal(true);
        expect(router.routeExists('editgear')).to.equal(true);
        expect(router.routeExists('bookingrequest')).to.equal(true);
        expect(router.routeExists('gearavailability')).to.equal(true);
        expect(router.routeExists('booking')).to.equal(true);
        expect(router.routeExists('payment')).to.equal(true);
        expect(router.routeExists('paymentsuccessful')).to.equal(true);
        expect(router.routeExists('submerchantregistration')).to.equal(true);
    });

    it('Can set user location', function(done) {
        App.setUserLocation('Copenhagen', function() {
            expect(App.user.data.currentCity).to.be.a('string');
            expect(App.user.data.currentCity.length).to.be.above(0);
            done();
        });
    });

    it('Can handle cookie warning');
});
