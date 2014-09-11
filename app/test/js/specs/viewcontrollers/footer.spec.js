define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/footer'],
	function($, chai, Sinon, Footer) {
		var expect = chai.expect;
		
		describe('Footer ViewController', function() {
			it('Provides the Footer ViewController', function() {
				expect(Footer.constructor).to.be.a('function');
			});
		});
	}
);
