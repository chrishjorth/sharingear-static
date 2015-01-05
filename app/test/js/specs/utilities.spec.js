/**
 * @author: Chris Hjorth
 */

 'use strict';

define(
	['underscore', 'jquery', 'chai', 'sinon', 'utilities', 'googlemaps', 'moment'],
	function(_, $, chai, Sinon, Utilities, GoogleMaps, Moment) {
		var expect = chai.expect;
		
		describe('Utilities', function() {
			beforeEach(function() {
				this.ajaxStub = sinon.stub($, 'ajax', function(options) {
					options.success({
						response: 'test'
					});
				});
				this.FormDataAppendStub = sinon.stub(FormData.prototype, 'append', function() {});
				this.GeocoderStub = sinon.stub(GoogleMaps.Geocoder.prototype, 'geocode', function(latLng, callback) {
					callback();
				});
			});

			afterEach(function() {
				$.ajax.restore();
				FormData.prototype.append.restore();
				GoogleMaps.Geocoder.prototype.geocode.restore();
			});

			it('Can inherit an object', function() {
				var testParent, TestChildConstructor, testChild;

				function TestParentConstructor(options) {
					this.testProperty = true;
					_.extend(this, options);
				}

				TestChildConstructor = Utilities.inherit(TestParentConstructor, {
					testProperty: false,
					anotherTestProperty: true
				});

				testParent = new TestParentConstructor();
				testChild = new TestChildConstructor();
				expect(testParent.testProperty).to.equal(true);
				expect(testChild.testProperty).to.equal(false);
				expect(testChild.anotherTestProperty).to.equal(true);
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

			it('Check if moment is between two moments', function() {
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
		});
	}
);
