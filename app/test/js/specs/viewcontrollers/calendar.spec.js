define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/calendar'],
	function($, chai, Sinon, Calendar) {
		var expect = chai.expect;
		
		describe('Calendar ViewController', function() {
			it('Provides the Calendar ViewController', function() {
				var calendarVC = new Calendar();
				expect(Calendar).to.be.a('function');
				expect(calendarVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
