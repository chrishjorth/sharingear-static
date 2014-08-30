define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard', 'app'],
	function($, chai, Sinon, Dashboard, App) {
		require(['text!../templates/dashboard.html'], function(DashboardTemplate) {
			var expect = chai.expect;
		
			describe('Dashboard ViewController', function() {

				beforeEach(function() {
					sinon.stub(App.router, 'navigateTo');
					this.$fixtures = $('#fixtures');
					this.dashboard = new Dashboard({name: 'testVC', $element: this.$fixtures, labels: {}, template: DashboardTemplate, path: 'dashboard'});
					sinon.spy(this.dashboard, 'loadSubView');
				});

				afterEach(function() {
					this.dashboard.loadSubView.restore();
					this.dashboard.close();
					this.$fixtures.empty();
					App.router.navigateTo.restore();
				});

				it('Provides the Dashboard ViewController', function() {
					expect(Dashboard).to.be.a('function');
				});

				it('Can initialize correctly', function() {
					sinon.assert.calledOnce(App.router.navigateTo);
				});
			});
		});
	}
);
