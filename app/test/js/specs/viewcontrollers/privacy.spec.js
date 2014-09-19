define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/privacy'],
	function($, chai, Sinon, Privacy) {
		var expect = chai.expect;
		
		describe('Privacy ViewController', function() {
			it('Provides the Privacy ViewController', function() {
				expect(Privacy.constructor).to.be.a('function');
			});
		});
	}
);
