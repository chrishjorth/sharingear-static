/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var chai = require('chai'),
    $ = require('jquery'),
    GoogleMaps = require('../../../js/libraries/mscl-googlemaps.js'),
    Facebook = require('../../../js/libraries/mscl-facebook.js'),

    App = require('../../../js/app.js'),
    User = require('../../../js/models/user.js'),
    Localization = require('../../../js/models/localization.js'),

    ContentClassification = require('../../../js/models/contentclassification.js'),

    expect;

require('script!../../../node_modules/sinon/pkg/sinon.js');

expect = chai.expect;

describe('App', function() {
    beforeEach(function() {
        this.$fixtures = $('#fixtures');
        this.setUserLocationSpy = sinon.spy(App, 'setUserLocation');
        this.GoogleMapsLoadStub = sinon.stub(GoogleMaps, 'load', function() {});
        this.FacebookLoadStub = sinon.stub(Facebook, 'load', function() {});
    });

    afterEach(function() {
        App.setUserLocation.restore();
        this.$fixtures.empty();
        GoogleMaps.load.restore();
        Facebook.load.restore();
    });

    it('Provides the app object', function() {
        expect(App).to.be.an('object');
        expect(App.run).to.be.a('function');
        expect(App.setUserLocation).to.be.a('function');
        expect(App).to.have.property('router');
        expect(App).to.have.property('user');
        expect(App).to.have.property('rootVC');
    });

    it('Can initialize Sharingear', function(done) {
        var spec = this;
        this.restoreLoginSpy = sinon.stub(User.prototype, 'restoreLogin', function(callback) {
            callback({
                status: null //We simulate the situation of a user that is not logged in. The initialization of Sharingear is the same anyhow for this module.
            });
        });
        this.localizationFetchStub = sinon.stub(Localization, 'fetch', function() {});
        this.ContentClassificationStub = sinon.stub(ContentClassification, 'getClassification', function() {});

        App.run(function() {
            sinon.assert.calledOnce(spec.localizationFetchStub);
            sinon.assert.calledOnce(spec.GoogleMapsLoadStub);
            sinon.assert.calledOnce(spec.FacebookLoadStub);
            
            expect(App.user instanceof User).to.equal(true);
            sinon.assert.calledOnce(spec.restoreLoginSpy);
            
            sinon.assert.calledOnce(spec.ContentClassificationStub);
            
            sinon.assert.calledOnce(spec.setUserLocationSpy);
            
            User.prototype.restoreLogin.restore();
            Localization.fetch.restore();
            ContentClassification.getClassification.restore();
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
