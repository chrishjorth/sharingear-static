define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/listyourgear'],
	function($, chai, Sinon, ListYourGear) {
		var expect = chai.expect;
		
		describe('List your gear ViewController', function() {
			it('Provides the ListYourGear ViewController', function() {
				var listYourGearVC = new ListYourGear();
				expect(ListYourGear).to.be.a('function');
				expect(listYourGearVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
