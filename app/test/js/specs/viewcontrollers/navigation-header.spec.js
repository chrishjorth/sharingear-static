define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/navigation-header'],
	function($, chai, Sinon, NavigationHeader) {
		require(['text!../templates/navigation-header.html'], function(NavigationHeaderTemplate) {
			var expect = chai.expect;
		
			describe('NavigationHeader ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.navHeader = new NavigationHeader({name: 'testVC', $element: this.$fixtures, labels: {}, template: NavigationHeaderTemplate});
					this.navHeader.render();
				});

				afterEach(function() {
					this.navHeader.close();
					this.$fixtures.empty();
				});

				it('Provides the NavigationHeader ViewController', function() {
					var navHeadVC = new NavigationHeader();
					expect(NavigationHeader).to.be.a('function');
				});

				it('Can login', function(done) {
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
