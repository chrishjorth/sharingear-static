define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/yourgear'],
	function($, chai, Sinon, YourGear) {
		var expect = chai.expect;
		
		describe('Your gear ViewController', function() {
			it('Provides the Your gear ViewController', function() {
				var yourGearVC = new YourGear();
				expect(YourGear).to.be.a('function');
				expect(yourGearVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
