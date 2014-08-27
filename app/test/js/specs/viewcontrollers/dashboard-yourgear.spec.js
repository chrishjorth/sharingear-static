define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard-yourgear'],
	function($, chai, Sinon, YourGear) {
		require(['text!../templates/dashboard-yourgear.html'], function(YourGearTemplate) {
			var expect = chai.expect;
		
			describe('Dashboard Your gear ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.yourgear = new YourGear({name: 'testVC', $element: this.$fixtures, labels: {}, template: YourGearTemplate, path: 'dashboard/yourgear'});
					sinon.spy(this.yourgear, 'populateYourGear');
				});

				afterEach(function() {
					this.yourgear.populateYourGear.restore();
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
			});
		});
	}
);
