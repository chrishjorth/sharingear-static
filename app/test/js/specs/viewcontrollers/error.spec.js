define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/error'],
	function($, chai, Sinon, Error) {
		var expect = chai.expect;
		
		describe('Error ViewController', function() {
			it('Provides the Error ViewController', function() {
				var errorVC = new Error();
				expect(Error).to.be.a('function');
				expect(errorVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
