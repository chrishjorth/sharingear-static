define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/gearpricing', 'app'],
	function($, chai, Sinon, GearPricing, App) {
		require(['text!../templates/gearpricing.html'], function(GearPricingTemplate) {
			var expect = chai.expect;
		
			describe('Gear pricing ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.gearPricing = new GearPricing.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: GearPricingTemplate, path: 'gearpricing'});
					sinon.spy(this.gearPricing, 'setupEvents');
					sinon.stub(App.router, 'closeModalView');
				});

				afterEach(function() {
					this.gearPricing.setupEvents.restore();
					App.router.closeModalView.restore();
					this.gearPricing.close();
					this.$fixtures.empty();
				});

				it('Provides the Gear pricing ViewController', function() {
					expect(GearPricing.constructor).to.be.a('function');
				});

				it('Can render', function(done) {
					var spec = this;
					this.gearPricing.render(function() {
						sinon.assert.calledOnce(spec.gearPricing.setupEvents);
						done();
					});
				});

				it('Can handle cancel', function(done) {
					var spec = this;
					this.gearPricing.render(function() {
						expect($('#gearpricing-form .btn-cancel', spec.$fixtures).length).to.equal(1);
						spec.gearPricing.handleCancel();
						sinon.assert.calledOnce(App.router.closeModalView);
						done();
					});
				});

				it('Can handle save', function(done) {
					var spec = this;
					this.gearPricing.render(function() {
						expect($('#gearpricing-form .btn-cancel', spec.$fixtures).length).to.equal(1);
						spec.gearPricing.handleSave();
						sinon.assert.calledOnce(App.router.closeModalView);
						done();
					});
				});
			});
		});
	}
);
