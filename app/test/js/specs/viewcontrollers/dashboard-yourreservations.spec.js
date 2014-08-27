define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/dashboard-yourreservations'],
	function($, chai, Sinon, YourReservations) {
		require(['text!../templates/dashboard-yourreservations.html'], function(YourReservationsTemplate) {
			var expect = chai.expect;
		
			describe('Dashboard Your reservations ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.yourReservations = new YourReservations({name: 'testVC', $element: this.$fixtures, labels: {}, template: YourReservationsTemplate, path: 'dashboard/yourreservations'});
					sinon.spy(this.yourReservations, 'populateYourReservations');
				});

				afterEach(function() {
					this.yourReservations.populateYourReservations.restore();
					this.yourReservations.close();
					this.$fixtures.empty();
				});

				it('Provides the Dashboard Your reservations ViewController', function() {
					expect(YourReservations).to.be.a('function');
				});

				it('Can render', function() {
					this.yourReservations.render();
					sinon.assert.calledOnce(this.yourReservations.populateYourReservations);
				});
			});
		});
	}
);
