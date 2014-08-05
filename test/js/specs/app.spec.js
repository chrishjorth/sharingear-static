define(
	['jquery', 'chai', 'app'],
	function($, chai, App) {
		var expect = chai.expect;
		
		describe('App', function() {
			it('Provides the app object', function() {
				expect(App).to.be.an('object');
			});
		});
	}
);
