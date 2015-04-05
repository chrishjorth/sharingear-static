/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var chai = require('chai'),
	$ = require('jquery'),
    GoogleMaps = require('../../../js/libraries/mscl-googlemaps.js'),

	App = require('../../../js/app.js'),

    ContentClassification = require('../../../js/models/contentclassification.js'),

	expect;

require('script!../../../node_modules/sinon/pkg/sinon.js');

expect = chai.expect;

describe('App', function() {
    beforeEach(function() {
        this.$fixtures = $('#fixtures');
        //this.$fixtures.html('<div class="navigation-header"></div>');
        this.loginSpy = sinon.stub(App.user, 'login', function(callback) {
            callback({
                status: null //We simulate the situation of a user that is not logged in. The initialization of Sharingear is the same anyhow for this module.
            });
        });
        this.setUserLocationSpy = sinon.spy(App, 'setUserLocation');
        this.GoogleMapsLoadStub = sinon.stub(GoogleMaps, 'load', function() {});
        this.ContentClassificationStub = sinon.stub(App.contentClassification, 'getClassification', function() {});
    });

    afterEach(function() {
        App.user.login.restore();
        App.setUserLocation.restore();
        this.$fixtures.empty();
        GoogleMaps.load.restore();
        App.contentClassification.getClassification.restore();
    });

    it('Provides the app object', function() {
        expect(App).to.be.an('object');
        expect(App.run).to.be.a('function');
        expect(App).to.have.property('router');
        expect(App).to.have.property('user');
        expect(App).to.have.property('rootVC');
        expect(App).to.have.property('gearClassification');
    });

    it('Can initialize Sharingear', function(done) {
        var spec = this;
        App.run(function() {
            sinon.assert.calledOnce(spec.GoogleMapsLoadStub);
            expect(App.user).to.be.an('object');
            sinon.assert.calledOnce(spec.loginSpy);
            expect(App.contentClassification).to.be.an('object');
            sinon.assert.calledOnce(spec.ContentClassificationStub);
            sinon.assert.calledOnce(spec.setUserLocationSpy);
            done();
        });
    });

    it('Can set user location', function(done) {
        App.setUserLocation('Copenhagen', function() {
            expect(App.user.data.currentCity).to.be.a('string');
            expect(App.user.data.currentCity.length).to.be.above(0);
            done();
        });
    });
});
