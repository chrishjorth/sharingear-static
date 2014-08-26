define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/aboutus'],
	function($, chai, Sinon, AboutUs) {
		var expect = chai.expect;
		
		describe('About us ViewController', function() {
			it('Provides the About us ViewController', function() {
				var aboutUsVC = new AboutUs();
				expect(AboutUs).to.be.a('function');
				expect(aboutUsVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
