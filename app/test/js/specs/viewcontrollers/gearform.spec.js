define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/gearform'],
	function($, chai, Sinon, GearForm) {
		var expect = chai.expect;
		
		describe('Gear form ViewController', function() {
			it('Provides the Gear form ViewController', function() {
				var gearFormVC = new GearForm();
				expect(GearForm).to.be.a('function');
				expect(gearFormVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
