/**
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'chai', 'sinon', 'model', 'app'],
	function($, chai, Sinon, Model, App) {
		var expect = chai.expect;
		
		describe('Model', function() {
			before(function() {
				this.model = new Model.constructor({
					rootURL: App.API_URL
				});
			});

			beforeEach(function() {
				this.ajaxStub = sinon.stub($, 'ajax', function(options) {
					options.success({
						response: 'test'
					});
				});
			});

			afterEach(function() {
				$.ajax.restore();
			});

			it('Provides the model object', function() {
				expect(Model).to.be.an('object');
				expect(Model).to.have.property('constructor');
				expect(Model).to.have.property('inherit');
			});

			it('Can be constructed', function() {
				expect(this.model.rootURL).to.equal(App.API_URL);
				expect(this.model.data).to.equal(null);
			});

			it('Can perform GET requests', function(done) {
				var spec = this;
				this.model.get('/someurl', function() {
					sinon.assert.calledOnce(spec.ajaxStub);
					expect(spec.ajaxStub.args[0][0].url).to.equal(App.API_URL + '/someurl');
					done();
				});
			});

			it('Can perform POST requests', function(done) {
				var spec = this;
				this.model.post('/someurl', {test: 'test1'}, function() {
					sinon.assert.calledOnce(spec.ajaxStub);
					expect(spec.ajaxStub.args[0][0].url).to.equal(App.API_URL + '/someurl');
					expect(spec.ajaxStub.args[0][0].data.test).to.equal('test1');
					done();
				});
			});

			it('Can perform PUT requests', function(done) {
				var spec = this;
				this.model.put('/someurl', {test: 'test2'}, function() {
					sinon.assert.calledOnce(spec.ajaxStub);
					expect(spec.ajaxStub.args[0][0].url).to.equal(App.API_URL + '/someurl');
					expect(spec.ajaxStub.args[0][0].data.test).to.equal('test2');
					done();
				});
			});

			it('Can perform DELETE requests');
		});
	}
);