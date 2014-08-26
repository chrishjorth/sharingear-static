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
					sinon.spy(this.dashboard, 'renderSubView');
				});

				afterEach(function() {
					this.dashboard.loadSubView.restore();
					this.dashboard.renderSubView.restore();
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

				it('Can render', function(done) {
					var spec = this;
					this.dashboard.render(function() {
						sinon.assert.calledOnce(spec.dashboard.loadSubView);
						sinon.assert.calledOnce(spec.dashboard.renderSubView);
						done();
					});
				});

				it('Can get profile parameters', function() {
					var parameters = this.dashboard.getProfileParameters();
					expect(parameters).to.have.property('name');
					expect(parameters).to.have.property('hometown');
					expect(parameters).to.have.property('bio');
					expect(parameters).to.have.property('genres');
				});

				it('Can get subview parameters', function() {
					var parameters = this.dashboard.getSubviewParameters();
					expect(parameters).to.be.an('object');
				});

				it('Can render your gear', function(done) {
					this.dashboard.renderYourGear([{}], function() {
						done();
					});
				});
			});
		});
	}
);
