define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/navigation-header'],
	function($, chai, Sinon, NavigationHeader) {
		var expect = chai.expect;
		
		describe('NavigationHeader ViewController', function() {
			it('Provides the NavigationHeader ViewController', function() {
				var navHeadVC = new NavigationHeader();
				expect(NavigationHeader).to.be.a('function');
				expect(navHeadVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
