define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/navigation-header', 'app', 'models/User'],
	function($, chai, Sinon, NavigationHeader, App, User) {
		require(['text!../templates/navigation-header.html'], function(NavigationHeaderTemplate) {
			var expect = chai.expect;
		
			describe('NavigationHeader ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.navHeader = new NavigationHeader.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: NavigationHeaderTemplate});
					this.navHeader.render();
				});

				afterEach(function() {
					this.navHeader.close();
					this.$fixtures.empty();
				});

				it('Provides the NavigationHeader ViewController', function() {
					expect(NavigationHeader.constructor).to.be.a('function');
				});

				it('Can login', function(done) {
					App.user = new User.constructor({
						rootURL: App.API_URL
					});

					sinon.stub(App.user, 'login', function() {
						App.user.login.restore();
						done();
					});

					this.navHeader.handleLogin({
						data: this.navHeader
					}, function() {
						done();
					});
				});
			});
		});
	}
);
