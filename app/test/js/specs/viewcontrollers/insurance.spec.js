define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/insurance'],
	function($, chai, Sinon, Insurance) {
		var expect = chai.expect;
		
		describe('Insurance ViewController', function() {
			it('Provides the Insurance ViewController', function() {
				expect(Insurance.constructor).to.be.a('function');
			});
		});
	}
);
