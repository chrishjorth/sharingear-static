define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/gearprofile'],
	function($, chai, Sinon, GearProfile) {
		var expect = chai.expect;
		
		describe('Gear profile ViewController', function() {
			it('Provides the Gear profile ViewController', function() {
				var gearProfileVC = new GearProfile();
				expect(GearProfile).to.be.a('function');
				expect(gearProfileVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
