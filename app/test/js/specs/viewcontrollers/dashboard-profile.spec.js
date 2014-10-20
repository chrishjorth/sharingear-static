define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard-profile'],
	function($, chai, Sinon, Profile) {
		require(['text!../templates/dashboard-profile.html'], function(ProfileTemplate) {
			var expect = chai.expect;
		
			describe('Dashboard Profile ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.profile = new Profile.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: ProfileTemplate, path: 'dashboard/profile'});
				});

				afterEach(function() {
					this.profile.close();
					this.$fixtures.empty();
				});

				it('Provides the Dashboard Profile ViewController', function() {
					expect(Profile.constructor).to.be.a('function');
				});
			});
		});
	}
);
