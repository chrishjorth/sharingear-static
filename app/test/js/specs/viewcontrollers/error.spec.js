define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/error'],
	function($, chai, Sinon, Error) {
		var expect = chai.expect;
		
		describe('Error ViewController', function() {
			it('Provides the Error ViewController', function() {
				expect(Error.constructor).to.be.a('function');
			});
		});
	}
);
