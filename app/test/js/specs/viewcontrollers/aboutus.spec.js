define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/aboutus'],
	function($, chai, Sinon, AboutUs) {
		var expect = chai.expect;
		
		describe('About us ViewController', function() {
			it('Provides the About us ViewController', function() {
				expect(AboutUs.constructor).to.be.a('function');
			});
		});
	}
);
