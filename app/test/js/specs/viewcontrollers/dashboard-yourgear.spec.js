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
					var yourGearVC = new YourGear();
					expect(YourGear).to.be.a('function');
				});

				it('Can render', function() {
					this.yourgear.render();
					sinon.assert.calledOnce(this.yourgear.populateYourGear);
				});

				it('Can handle edit gear event', function() {
					this.yourgear.handleEditGearItem();
					sinon.assert.calledOnce(App.router.openModalView);
				});
			});
		});
	}
);
