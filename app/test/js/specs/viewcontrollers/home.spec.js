define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/home'],
	function($, chai, Sinon, Home) {
		require(['text!../templates/home.html'], function(HomeTemplate) {
			var expect = chai.expect;
		
			describe('Home ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.home = new Home({name: 'testVC', $element: this.$fixtures, labels: {}, template: HomeTemplate});
				});

				afterEach(function() {
					this.home.close();
					this.$fixtures.empty();
				});

				it('Provides the Home ViewController', function() {
					var homeVC = new Home();
					expect(Home).to.be.a('function');
				});

				it('Sets up events after render', function() {
					this.home.render();
					expect(this.home.userEvents[0].eventType).to.equal('submit');
					expect(this.home.userEvents[0].element).to.equal('#home-search-form');
				});
			});
		});
	}
);
