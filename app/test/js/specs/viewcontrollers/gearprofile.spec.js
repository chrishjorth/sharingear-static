define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/gearprofile'],
	function($, chai, Sinon, GearProfile) {
		var expect = chai.expect;
		
		describe('Gear profile ViewController', function() {
			it('Provides the Gear profile ViewController', function() {
				expect(GearProfile.constructor).to.be.a('function');
			});
		});
	}
);
