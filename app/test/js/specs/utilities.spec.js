/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
    _ = require('underscore'),
    $ = require('jquery'),
    Moment = require('moment-timezone'),
    GoogleMaps = require('../../../js/libraries/mscl-googlemaps.js'),

    Utilities = require('../../../js/utilities.js'),

    expect;

expect = chai.expect;

describe('Utilities', function() {
    beforeEach(function() {
        this.ajaxStub = sinon.stub($, 'ajax', function(options) {
            options.success({
                response: 'test'
            });
        });
        this.FormDataAppendStub = sinon.stub(FormData.prototype, 'append', function() {});
        this.GeocoderStub = sinon.stub(GoogleMaps, 'Geocoder', function() {
            this.geocode = function(latLng, callback) {
                callback(null, null);
            };
        });
        this.LatLngStub = sinon.stub(GoogleMaps, 'LatLng', function() {});
    });

    afterEach(function() {
        $.ajax.restore();
        FormData.prototype.append.restore();
        GoogleMaps.Geocoder.restore();
        GoogleMaps.LatLng.restore();
    });

    it('Provides the utilities object', function() {
        expect(Utilities).to.be.an('object');
        expect(Utilities.getBaseURL).to.be.a('function');
        expect(Utilities.ajajFileUpload).to.be.a('function');
        expect(Utilities.getCityFromCoordinates).to.be.a('function');
        expect(Utilities.getQueryString).to.be.a('function');
        expect(Utilities.getQueryStringParameterValue).to.be.a('function');
        expect(Utilities.capitalizeString).to.be.a('function');
        expect(Utilities.isMomentBetween).to.be.a('function');
        expect(Utilities.isMobile).to.be.a('function');
    });

    it('Can get base url from current url', function() {
        expect(Utilities.getBaseURL()).to.equal(window.location.origin);
    });

    it('Can upload a file via AJAJ', function(done) {
        var spec = this;
        Utilities.ajajFileUpload('/someurl', 'someproof', 'somefilename', 'filedata', function() {
            sinon.assert.calledOnce(spec.ajaxStub);
            expect(spec.ajaxStub.args[0][0].type).to.equal('POST');
            expect(spec.ajaxStub.args[0][0].url).to.equal('/someurl');
            expect(spec.FormDataAppendStub.args[0][0]).to.equal('uploadedfile');
            expect(spec.FormDataAppendStub.args[0][1]).to.equal('filedata');
            expect(spec.FormDataAppendStub.args[1][0]).to.equal('fileName');
            expect(spec.FormDataAppendStub.args[1][1]).to.equal('somefilename');
            expect(spec.FormDataAppendStub.args[2][0]).to.equal('secretProof');
            expect(spec.FormDataAppendStub.args[2][1]).to.equal('someproof');
            done();
        });
    });

    it('Can get city from location coordinates', function() {
        var spec = this;
        Utilities.getCityFromCoordinates(0.0, 0.0, function() {
            sinon.assert.calledOnce(spec.GeocoderStub);
        });
    });

    it('Can return current querystring', function() {
        var location = window.location.pathname,
            result;
        history.replaceState({}, '', location + '?test=1');
        result = Utilities.getQueryString();
        expect(result).to.equal('test=1');
        history.replaceState({}, '', location);
    });

    it('Can return value for specified key in querystring', function() {
        var value;
        value = Utilities.getQueryStringParameterValue('test1=1&test2=2', 'test1');
        expect(value).to.equal('1');
        value = Utilities.getQueryStringParameterValue('test1=1&test2=2', 'test2');
        expect(value).to.equal('2');
    });

    it('Can capitalize a string', function() {
        var value;
        value = Utilities.capitalizeString('guitar');
        expect(value).to.equal('Guitar');
    });

    it('Can check if moment is between two moments', function() {
        var intervalStart, intervalEnd, result;
        intervalStart = new Moment('05-01-2015', 'DD-MM-YYYY');
        intervalEnd = new Moment('07-01-2015', 'DD-MM-YYYY');
        result = Utilities.isMomentBetween(new Moment('06-01-2015', 'DD-MM-YYYY'), intervalStart, intervalEnd);
        expect(result).to.equal(true);
        result = Utilities.isMomentBetween(new Moment('05-01-2015', 'DD-MM-YYYY'), intervalStart, intervalEnd);
        expect(result).to.equal(true);
        result = Utilities.isMomentBetween(new Moment('05-02-2015', 'DD-MM-YYYY'), intervalStart, intervalEnd);
        expect(result).to.equal(false);
    });

    it('Can check if environment is mobile', function() {
        var result;
        sinon.stub($.prototype, 'width', function() {
            return 320;
        });
        result = Utilities.isMobile();
        expect(result).to.equal(true);
        $.prototype.width.restore();
    });
});
