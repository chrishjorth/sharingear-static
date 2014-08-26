define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/insurance'],
	function($, chai, Sinon, Insurance) {
		var expect = chai.expect;
		
		describe('Insurance ViewController', function() {
			it('Provides the Insurance ViewController', function() {
				var insuranceVC = new Insurance();
				expect(Insurance).to.be.a('function');
				expect(insuranceVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
