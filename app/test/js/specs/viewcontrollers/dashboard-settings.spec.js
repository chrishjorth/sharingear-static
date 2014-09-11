define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard-settings'],
	function($, chai, Sinon, Settings) {
		var expect = chai.expect;
		
		describe('Settings ViewController', function() {
			it('Provides the Settings ViewController', function() {
				expect(Settings.constructor).to.be.a('function');
			});
		});
	}
);
