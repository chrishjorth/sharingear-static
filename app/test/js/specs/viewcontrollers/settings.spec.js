define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/settings'],
	function($, chai, Sinon, Settings) {
		var expect = chai.expect;
		
		describe('Settings ViewController', function() {
			it('Provides the Settings ViewController', function() {
				var settingsVC = new Settings();
				expect(Settings).to.be.a('function');
				expect(settingsVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
