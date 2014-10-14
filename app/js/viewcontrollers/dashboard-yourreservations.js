/**
 * Controller for the Sharingear Your reservations page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gearlist'],
	function(ViewController, App, GearList) {
		var YourReservations = ViewController.inherit({
			reservationBlockID: 'yourreservations-gear-block',
			gearList: new GearList.constructor({
				rootURL: App.API_URL
			}),

			didRender: didRender,
			populateYourReservations: populateYourReservations
		}); 
		return YourReservations;

		function didRender() {
			var view = this,
				userID = null;

			if(App.user.data) {
				userID = App.user.data.id;
			}

			this.gearList.getUserReservations(userID, function(yourReservations) {
				view.populateYourReservations(yourReservations);
			});
		}

		function populateYourReservations(yourReservations, callback) {
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					defaultReservation, reservation;

				defaultReservation = {
					id: null,
					type: '',
					subtype: '',
					brand: '',
					model: '',
					description: '',
					img_url: 'images/logotop.png',
					price_a: 0,
					price_b: 0,
					price_c: 0,
					city: '',
					owner_id: null
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