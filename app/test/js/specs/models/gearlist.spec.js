define(
	['jquery', 'chai', 'sinon', 'models/gearlist'],
	function($, chai, Sinon, GearList) {
		var expect = chai.expect;
		
		describe('GearList model', function() {
			beforeEach(function() {
				this.gearList = new GearList.constructor();
			});

			afterEach(function() {
			});

			it('Provides the GearList model', function() {
				expect(GearList.constructor).to.be.a('function');
			});

			it('Can search', function(done) {
				this.gearList.search('some location', 'some gear', '20140829-20140901', function() {
					done();
				});
			});
		});
	}
);