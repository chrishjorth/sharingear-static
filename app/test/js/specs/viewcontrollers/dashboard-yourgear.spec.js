define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard-yourgear', 'app'],
	function($, chai, Sinon, YourGear, App) {
		require(['text!../templates/dashboard-yourgear.html'], function(YourGearTemplate) {
			var expect = chai.expect;
		
			describe('Dashboard Your gear ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.yourgear = new YourGear({name: 'testVC', $element: this.$fixtures, labels: {}, template: YourGearTemplate, path: 'dashboard/yourgear'});
					sinon.spy(this.yourgear, 'populateYourGear');
					sinon.stub(App.router, 'openModalView');
				});

				afterEach(function() {
					this.yourgear.populateYourGear.restore();
					App.router.openModalView.restore();
					this.yourgear.close();
					this.$fixtures.empty();
				});

				it('Provides the Dashboard Your gear ViewController', function() {
					expect(YourGear).to.be.a('function');
				});

				it('Can render', function(done) {
					var spec = this;
					sinon.stub(this.yourgear.gearList, 'getUserGear', function() {
						spec.yourgear.gearList.getUserGear.restore();
						done();
					});
					this.yourgear.render();
				});

				it('Can handle edit gear event', function() {
					this.yourgear.handleEditGearItem();
					sinon.assert.calledOnce(App.router.openModalView);
				});
			});
		});
	}
);
