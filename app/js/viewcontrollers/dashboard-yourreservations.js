/**
 * Controller for the Sharingear Your reservations page view.
 * @author: Chris Hjorth
 */

define(
	['utilities', 'viewcontroller', 'app', 'models/gearlist'],
	function(Utilities, ViewController, App, GearList) {
		var YourReservations = Utilities.inherit(ViewController, {
			reservationBlockID: 'yourreservations-gear-block',
			gearList: new GearList({
				rootURL: App.API_URL
			}),

			didRender: didRender,
			populateYourReservations: populateYourReservations
		}); 
		return YourReservations;

		function didRender() {
			var view = this;
			this.gearList.getUserReservations(App.user.data.id, function(yourReservations) {
				view.populateYourReservations(yourReservations);
			});
		}

		function populateYourReservations(yourReservations, callback) {
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					defaultReservation, reservation;

				defaultReservation = {
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: '',
					description: '',
					photos: '',
					price: 0,
					seller_user_id: 0,
					city: '',
					address: '',
					country: '',
					price1: 0,
					price2: 0,
					price3: 0
				};

				for(i = 0; i < yourReservations.length; i++) {
					reservation = yourReservations[i];
					_.extend(defaultReservation, reservation);
					$('#' + view.reservationBlockID).append(yourReservationsItemTemplate(defaultReservation));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}

			});
		}
	}
);