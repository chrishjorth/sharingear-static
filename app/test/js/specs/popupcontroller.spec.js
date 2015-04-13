/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var chai = require('chai'),
    $ = require('jquery'),

    PopupController = require('../../../js/popupcontroller.js'),

    expect;

expect = chai.expect;

describe('PopupController', function() {
    before(function() {
        this.$fixtures = $('#fixtures');
        this.pc = new PopupController({
            $element: this.$fixtures,
            template: '<div>Test Popup</div>',
        });
    });

    after(function() {
        this.$fixtures.empty();
    });

    it('Can be constructed', function() {
        expect(PopupController).to.be.a('function');
        expect(this.pc instanceof PopupController).to.equal(true);
        expect(this.pc).to.have.property('$element');
        expect(this.pc).to.have.property('title');
        expect(this.pc.$element).to.equal(this.$fixtures);
    });

    it('Can be shown', function() {
        var renderSpy = sinon.spy(this.pc, 'render');
        this.pc.show();
        sinon.assert.calledOnce(renderSpy);
        this.pc.render.restore();
    });

    it('Can be hidden', function() {
    	var closeSpy = sinon.spy(this.pc, 'close');
    	this.pc.hide();
    	sinon.assert.calledOnce(closeSpy);
    	this.pc.close.restore();
    });

    it('Can set title', function() {
    	this.pc.setTitle('Test title');
    	expect(this.pc.title).to.equal('Test title');
    });
});
