define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/profile'],
	function($, chai, Sinon, Profile) {
		var expect = chai.expect;
		
		describe('Profile ViewController', function() {
			it('Provides the Profile ViewController', function() {
				var profileVC = new Profile();
				expect(Profile).to.be.a('function');
				expect(profileVC.constructor.name).to.equal('ViewController');
			});
		});
	}
);
