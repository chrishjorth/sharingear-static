define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/yourreservations'],
	function($, chai, Sinon, YourReservations) {
		var expect = chai.expect;
		
		describe('Your reservations ViewController', function() {
			it('Provides the Your reservations ViewController', function() {
				var yourReservationsVC = new YourReservations();
				expect(YourReservations).to.be.a('function');
				expect(yourReservationsVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
