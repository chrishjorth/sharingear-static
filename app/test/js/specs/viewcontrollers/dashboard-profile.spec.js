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

				it('Has correct template parameters', function() {
					var parameters = this.profile.templateParameters;
					expect(parameters).to.have.property('name');
					expect(parameters).to.have.property('hometown');
					expect(parameters).to.have.property('bio');
					expect(parameters).to.have.property('genres');
				});
			});
		});
	}
);
