define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard-calendar'],
	function($, chai, Sinon, Calendar) {
		var expect = chai.expect;
		
		describe('Calendar ViewController', function() {
			it('Provides the Calendar ViewController', function() {
				expect(Calendar.constructor).to.be.a('function');
			});
		});
	}
);
