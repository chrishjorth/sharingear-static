/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
	
	PopupController = require('../../../js/popupcontroller.js'),

	expect;

expect = chai.expect;

describe('PopupController', function() {
	before(function() {
		this.$fixtures = $('#fixtures');
		this.pc = new PopupController.constructor({
			$element: this.$fixtures,
			template: '<div>Test Popup</div>',
		});
	});

	after(function() {
		this.$fixtures.empty();
	});

    it('Provides the PopupController object', function() {
    	expect(PopupController).to.be.an('object');
        expect(PopupController).to.have.property('constructor');
        expect(PopupController).to.have.property('inherit');
    });

    it('Can be constructed', function() {
    	console.log(this.pc);
    	expect(this.pc.title).to.equal('Popup');
        expect(this.pc.$element).to.equal(this.$fixtures);
        //expect(this.pc.template.toString()).to.equal(_.template('<div>Test Popup</div>').toString());
    });
});