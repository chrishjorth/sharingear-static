/**
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'chai', 'sinon', 'viewcontroller'],
	function(_, $, chai, Sinon, ViewController) {
		var expect = chai.expect;
		
		describe('ViewController', function() {
			before(function() {
				this.$fixtures = $('#fixtures');
				this.vc = new ViewController.constructor({
					name: 'testVC',
					$element: this.$fixtures,
					labels: {},
					template: '<div>Test Template</div>',

					didInitialize: function() {},
					didRender: function() {},
					didClose: function() {},
					didResize: function() {}
				});
			});

			after(function() {
				this.$fixtures.empty();
			});

			it('Provides the viewcontroller object', function() {
				expect(ViewController).to.be.an('object');
				expect(ViewController).to.have.property('constructor');
				expect(ViewController).to.have.property('inherit');
			});

			it('Can be constructed', function() {
				expect(this.vc.name).to.equal('testVC');
				expect(this.vc.$element).to.equal(this.$fixtures);
				expect(this.vc.template.toString()).to.equal(_.template('<div>Test Template</div>').toString());
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
					didRenderSpy = sinon.spy(this.vc, 'didRender');
				this.vc.render();
				sinon.assert.calledOnce(unbindEventsSpy);
				expect(this.$fixtures.html()).to.equal('<div>Test Template</div>');
				sinon.assert.calledOnce(didRenderSpy);
				this.vc.unbindEvents.restore();
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

		});
	}
);
