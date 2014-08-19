define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard'],
	function($, chai, Sinon, Dashboard) {
		var expect = chai.expect;
		
		describe('Dashboard ViewController', function() {
			it('Provides the Dashboard ViewController', function() {
				var dashboardVC = new Dashboard();
				expect(Dashboard).to.be.a('function');
			});
		});
	}
);
