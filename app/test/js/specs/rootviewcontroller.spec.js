/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
    $ = require('jquery'),

    RootViewController = require('../../../js/rootviewcontroller.js'),
    Router = require('../../../js/router.js'),
    HeaderController = require('../../../js/viewcontrollers/navigation-header.js'),
    ViewController = require('../../../js/viewcontroller.js'),

    expect;

require('script!../../../node_modules/sinon/pkg/sinon.js');

expect = chai.expect;

describe('RootViewController', function() {
	before(function() {
		this.$fixtures = $('#fixtures');
	});

	after(function() {
		this.$fixtures.empty();
	});

    it('Provides the RootViewController object', function() {
        expect(RootViewController).to.be.an('object');
        expect(RootViewController).to.have.property('header');
        expect(RootViewController.initialize).to.be.a('function');
        expect(RootViewController.refresh).to.be.a('function');
        expect(RootViewController.loadHeader).to.be.a('function');
        expect(RootViewController.getCookie).to.be.a('function');
    });

    it('Can initialize', function() {
        var loadHeaderSpy = sinon.spy(RootViewController, 'loadHeader'),
            navigateToStub = sinon.stub(Router, 'navigateTo', function() {});

        RootViewController.initialize(function() {});
        sinon.assert.calledOnce(loadHeaderSpy);
        sinon.assert.calledOnce(navigateToStub);

        RootViewController.loadHeader.restore();
        Router.navigateTo.restore();
    });

    //TODO: Move this to router as the function was moved.
    /*it('Can refresh', function(done) {
        RootViewController.initialize(function() {
            var headerInitializeStub = sinon.stub(HeaderController.prototype, 'initialize', function() {}),
                headerRenderStub = sinon.stub(HeaderController.prototype, 'render', function() {}),
                vcInitializeStub = sinon.stub(ViewController.prototype, 'initialize', function() {}),
                vcRenderStub = sinon.stub(ViewController.prototype, 'render', function() {});

            RootViewController.refresh();

            sinon.assert.calledOnce(headerInitializeStub);
            sinon.assert.calledOnce(headerRenderStub);
            sinon.assert.calledOnce(vcInitializeStub);
            sinon.assert.calledOnce(vcRenderStub);

            HeaderController.prototype.initialize.restore();
            HeaderController.prototype.render.restore();
            ViewController.prototype.initialize.restore();
            ViewController.prototype.render.restore();

            done();
        });
    });*/

	it('Can load header', function() {
		var headerInitializeStub = sinon.stub(HeaderController.prototype, 'initialize', function() {}),
			headerRenderStub = sinon.stub(HeaderController.prototype, 'render', function() {});
		
		RootViewController.loadHeader(this.$fixtures);
		
		expect(RootViewController.header.name).to.equal('header');
		sinon.assert.calledOnce(headerInitializeStub);
		sinon.assert.calledOnce(headerRenderStub);

		HeaderController.prototype.initialize.restore();
		HeaderController.prototype.render.restore();
	});

	it('Can get cookie', function() {
		document.cookie = 'cookie-test=1';
		expect(RootViewController.getCookie('cookie-test')).to.equal('1');
	});
});
