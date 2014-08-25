define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard'],
	function($, chai, Sinon, Dashboard) {
		require(['text!../templates/dashboard.html'], function(DashboardTemplate) {
			var expect = chai.expect;
		
			describe('Dashboard ViewController', function() {

				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.dashboard = new Dashboard({name: 'testVC', $element: this.$fixtures, labels: {}, template: DashboardTemplate, path: 'dashboard'});
					sinon.spy(this.dashboard, 'loadSubView');
					this.dashboard.render();
				});

				afterEach(function() {
					this.dashboard.loadSubView.restore();
					this.dashboard.close();
					this.$fixtures.empty();
				});

				it('Provides the Dashboard ViewController', function() {
					expect(Dashboard).to.be.a('function');
				});

				it('Can initialize correctly', function() {
					expect(this.dashboard.path).to.equal('dashboard/profile');
					expect(this.dashboard.subPath).to.equal('profile');
				});

				it('Can render', function() {
					sinon.assert.calledOnce(this.dashboard.loadSubView);
				});

				it('Can load subview', function(done) {
					this.dashboard.loadSubView(function() {
						done();
					});
				});
			});
		});
	}
);
