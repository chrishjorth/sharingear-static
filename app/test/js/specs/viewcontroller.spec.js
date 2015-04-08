/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
    $ = require('jquery'),

    ViewController = require('../../../js/viewcontroller.js'),

    expect;

require('script!../../../node_modules/sinon/pkg/sinon.js');

expect = chai.expect;

describe('ViewController', function() {
    before(function() {
        this.$fixtures = $('#fixtures');
        this.vc = new ViewController({
            $element: this.$fixtures,
            template: '<div>Test Template</div>',
            didInitialize: function() {},
            willRender: function() {},
            didRender: function() {},
            didResize: function() {},
            didClose: function() {}
        });
    });

    after(function() {
        this.$fixtures.empty();
    });

    it('Can be constructed', function() {
        expect(ViewController).to.be.a('function');
        expect(this.vc instanceof ViewController).to.equal(true);
        expect(this.vc).to.have.property('name');
        expect(this.vc).to.have.property('$element');
        expect(this.vc).to.have.property('template');
        expect(this.vc).to.have.property('templateParameters');
        expect(this.vc).to.have.property('labels');
        expect(this.vc).to.have.property('path');
        expect(this.vc).to.have.property('hasSubviews');
        expect(this.vc).to.have.property('$subViewContainer');
        expect(this.vc).to.have.property('subPath');
        expect(this.vc).to.have.property('passedData');
        expect(this.vc).to.have.property('ready');
    });

    it('Can initialize', function() {
        var setSubPathSpy = sinon.spy(this.vc, 'setSubPath'),
            didInitializeSpy = sinon.spy(this.vc, 'didInitialize');
        this.vc.initialize();
        expect(this.vc.userEvents).to.be.an('array');
        sinon.assert.calledOnce(setSubPathSpy);
        sinon.assert.calledOnce(didInitializeSpy);
        this.vc.setSubPath.restore();
        this.vc.didInitialize.restore();
    });

    it('Can render', function() {
        var unbindEventsSpy = sinon.spy(this.vc, 'unbindEvents'),
            willRenderSpy = sinon.spy(this.vc, 'willRender'),
            didRenderSpy = sinon.spy(this.vc, 'didRender');
        this.vc.render();
        sinon.assert.calledOnce(unbindEventsSpy);
        expect(this.$fixtures.html()).to.equal('<div>Test Template</div>');
        sinon.assert.calledOnce(willRenderSpy);
        sinon.assert.calledOnce(didRenderSpy);
        this.vc.unbindEvents.restore();
        this.vc.willRender.restore();
        this.vc.didRender.restore();
    });

    it('Can handle window resize event', function(done) {
        var spec = this;
        sinon.stub(this.vc, 'didResize', function() {
            spec.vc.didResize.restore();
            done();
        });
        this.vc.render();
        $(window).resize();
    });

    it('Can set sub-path', function() {
        this.vc.path = 'home';
        this.vc.setSubPath();
        expect(this.vc.subPath).to.equal('');
        this.vc.path = 'dashboard/profile';
        this.vc.setSubPath();
        expect(this.vc.subPath).to.equal('profile');
    });

    it('Can register and handle events', function(done) {
        var $testButton = $('<button type="button" href="javascript:;" class="testButton">Test button</button>'),
            vc = this.vc,
            eventDescriptor, callback;
        this.$fixtures.append($testButton);
        callback = function() {
            done();
        };
        vc.setupEvent('click', '.testButton', null, callback);
        expect(vc.userEvents.length).to.equal(1);
        eventDescriptor = vc.userEvents[0];
        expect(eventDescriptor.eventType).to.equal('click');
        expect(eventDescriptor.element).to.equal('.testButton');
        expect(eventDescriptor.callback.toString()).to.equal(callback.toString());
        $testButton.click();
    });

    it('Can unbind events', function() {
        this.vc.unbindEvents();
        expect(this.vc.userEvents.length).to.equal(0);
    });

    it('Can close', function() {
        var unbindEventsSpy = sinon.spy(this.vc, 'unbindEvents'),
            didCloseSpy = sinon.spy(this.vc, 'didClose');
        this.vc.close();
        sinon.assert.calledOnce(unbindEventsSpy);
        expect(this.$fixtures.html()).to.equal('');
        sinon.assert.calledOnce(didCloseSpy);
        this.vc.unbindEvents.restore();
        this.vc.didClose.restore();
    });

    it('Can register viewcontroller events', function(done) {
        var testVC = new ViewController();
        testVC.name = 'testVC2';
        testVC.$element = this.$fixtures;
        testVC.template = '<div>Test Template 2</div>';
        testVC.didInitialize = function() {};
        testVC.didRender = function() {};
        testVC.didClose = function() {};
        testVC.didResize = function() {};
        testVC.initialize();
        expect(testVC.events).to.be.an('object');
        expect(testVC.events).to.have.property('close');
        expect(testVC.events.close).to.be.an('array');
        expect(testVC.events.close.length).to.equal(0);
        expect(testVC.on).to.be.a('function');
        testVC.on('close', function() {
            done();
        });
        expect(testVC.events.close.length).to.equal(1);
        testVC.close();
    });
});
