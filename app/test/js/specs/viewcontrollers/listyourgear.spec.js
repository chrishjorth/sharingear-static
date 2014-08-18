define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/listyourgear'],
	function($, chai, Sinon, ListYourGear) {
		var expect = chai.expect;
		
		describe('Dashboard ViewController', function() {
			it('Provides the Dashboard ViewController', function() {
				var listYourGearVC = new ListYourGear();
				expect(ListYourGear).to.be.a('function');
				expect(listYourGearVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
