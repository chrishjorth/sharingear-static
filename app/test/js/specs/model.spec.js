/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
	$ = require('jquery'),

	Model = require('../../../js/model.js'),
	Config = require('../../../js/config.js'),

	expect;

require('script!../../../node_modules/sinon/pkg/sinon.js');

expect = chai.expect;

describe('Model', function() {
    before(function() {
        this.model = new Model({
            rootURL: Config.API_URL
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

    it('Can be constructed', function() {
        expect(Model).to.be.a('function');
        expect(this.model instanceof Model).to.equal(true);
        expect(this.model).to.have.property('rootURL');
        expect(this.model).to.have.property('data');
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
            expect(spec.ajaxStub.args[0][0].url).to.equal(Config.API_URL + '/someurl');
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
            expect(spec.ajaxStub.args[0][0].url).to.equal(Config.API_URL + '/someurl');
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
            expect(spec.ajaxStub.args[0][0].url).to.equal(Config.API_URL + '/someurl');
            expect(spec.ajaxStub.args[0][0].data.test).to.equal('test2');
            done();
        });
    });

    it('Can perform DELETE requests');
});
