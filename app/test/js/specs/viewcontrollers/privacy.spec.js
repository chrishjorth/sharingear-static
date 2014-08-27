define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/privacy'],
	function($, chai, Sinon, Privacy) {
		var expect = chai.expect;
		
		describe('Privacy ViewController', function() {
			it('Provides the Privacy ViewController', function() {
				var privacyVC = new Privacy();
				expect(Privacy).to.be.a('function');
				expect(privacyVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
