define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/gearpricing'],
	function($, chai, Sinon, GearPricing) {
		var expect = chai.expect;
		
		describe('Gear pricing ViewController', function() {
			it('Provides the Gear pricing ViewController', function() {
				var gearPricingVC = new GearPricing();
				expect(GearPricing).to.be.a('function');
				expect(gearPricingVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
