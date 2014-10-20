define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/listyourgear'],
	function($, chai, Sinon, ListYourGear) {
		var expect = chai.expect;
		
		describe('List your gear ViewController', function() {
			it('Provides the ListYourGear ViewController', function() {
				expect(ListYourGear.constructor).to.be.a('function');
			});
		});
	}
);
