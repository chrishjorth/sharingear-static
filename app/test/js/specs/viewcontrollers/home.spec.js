define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/home'],
	function($, chai, Sinon, Home) {
		var expect = chai.expect;
		
		describe('Home ViewController', function() {
			it('Provides the Home ViewController', function() {
				var homeVC = new Home();
				expect(Home).to.be.a('function');
				expect(homeVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
