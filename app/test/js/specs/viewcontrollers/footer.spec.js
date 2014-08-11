define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/footer'],
	function($, chai, Sinon, Footer) {
		var expect = chai.expect;
		
		describe('Footer ViewController', function() {
			it('Provides the Footer ViewController', function() {
				var footerVC = new Footer();
				expect(Footer).to.be.a('function');
				expect(footerVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
