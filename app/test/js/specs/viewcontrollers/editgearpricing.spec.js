define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/editgearpricing', 'app', 'models/gear'],
	function($, chai, Sinon, GearPricing, App, Gear) {
		require(['text!../templates/editgearpricing.html'], function(GearPricingTemplate) {
			var expect = chai.expect;
		
			describe('Gear pricing ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.testGear = new Gear.constructor({
						data: {
							type: '',
							subtype: '',
							brand: '',
							model: '',
							description: '',
							images: '',
							price_a: 0,
							price_b: 0,
							price_c: 0
						}
					});
					this.gearPricing = new GearPricing.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: GearPricingTemplate, path: 'gearpricing', passedData: this.testGear});
					sinon.spy(this.gearPricing, 'setupEvents');
					sinon.stub(App.router, 'closeModalView');
					sinon.stub(App.router, 'openModalView');
				});

				afterEach(function() {
					this.gearPricing.setupEvents.restore();
					App.router.closeModalView.restore();
					App.router.openModalView.restore();
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

				it('Can handle back', function(done) {
					var spec = this;
					this.gearPricing.render(function() {
						expect($('#editgearpricing-form .btn-cancel', spec.$fixtures).length).to.equal(1);
						spec.gearPricing.handleBack({
							data: spec.gearPricing
						});
						sinon.assert.calledOnce(App.router.openModalView);
						done();
					});
				});

				it('Can handle save', function(done) {
					var spec = this;
					this.gearPricing.render(function() {
						expect($('#editgearpricing-form .btn-cancel', spec.$fixtures).length).to.equal(1);
						spec.gearPricing.handleSave({
							data: spec.gearPricing
						});
						sinon.assert.calledOnce(App.router.closeModalView);
						done();
					});
				});
			});
		});
	}
);
