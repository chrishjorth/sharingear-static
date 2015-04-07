/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
	$ = require('jquery'),

	Model = require('../../../js/model.js'),
	App = require('../../../js/app.js'),

	expect;

expect = chai.expect;

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

    it('Can be inherited', function(done) {
        var subModel = Model.inherit({
            test: function() {
                done();
            }
        });
        expect(subModel).to.be.an('object');
        expect(subModel).to.have.property('constructor');
        expect(subModel).to.have.property('inherit');
        subModel = new subModel.constructor();
        subModel.test();
    });

    it('Can be initialized', function(done) {
        this.model.didInitialize = function() {
            done();
        };
        this.model.initialize();
    });

    it('Can perform GET requests', function(done) {
        var spec = this;
        this.model.get('/someurl', function() {
            sinon.assert.calledOnce(spec.ajaxStub);
            expect(spec.ajaxStub.args[0][0].type).to.equal('GET');
            expect(spec.ajaxStub.args[0][0].url).to.equal(App.API_URL + '/someurl');
            done();
        });
    });

    it('Can perform POST requests', function(done) {
        var spec = this;
        this.model.post('/someurl', {
            test: 'test1'
        }, function() {
            sinon.assert.calledOnce(spec.ajaxStub);
            expect(spec.ajaxStub.args[0][0].type).to.equal('POST');
            expect(spec.ajaxStub.args[0][0].url).to.equal(App.API_URL + '/someurl');
            expect(spec.ajaxStub.args[0][0].data.test).to.equal('test1');
            done();
        });
    });

    it('Can perform PUT requests', function(done) {
        var spec = this;
        this.model.put('/someurl', {
            test: 'test2'
        }, function() {
            sinon.assert.calledOnce(spec.ajaxStub);
            expect(spec.ajaxStub.args[0][0].type).to.equal('PUT');
            expect(spec.ajaxStub.args[0][0].url).to.equal(App.API_URL + '/someurl');
            expect(spec.ajaxStub.args[0][0].data.test).to.equal('test2');
            done();
        });
    });

    it('Can perform DELETE requests');
});
