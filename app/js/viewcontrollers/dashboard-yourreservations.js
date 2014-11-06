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
            if(this.gearList.isEmpty()) {
                this.gearList.getUserReservations(userID, function (data) {
                    if(data.length!==0){
                        view.populateYourReservations();
                    }else{
                        $("#yourreservations-gear-block").append("You don't have any reservations!")
                    }
                });
            }else{
                view.populateYourReservations();
            }
		}

		function populateYourReservations(callback) {
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					yourReserv = view.gearList.data,
                    defaultReservation, reservation;

				for(i = 0; i < yourReserv.length; i++) {
                    defaultReservation = {
                        id: null,
                        type: '',
                        subtype: '',
                        brand: '',
                        start_time:'',
                        end_time:'',
                        model: '',
                        images:'',
                        img_url: 'images/logotop.png',
                        price: 0,
                        city: '',
                        gear_status: 'status'
                    };

					reservation = yourReserv[i];
					_.extend(defaultReservation, reservation.data);
                    if(defaultReservation.images.length > 0) {
                        defaultReservation.img_url = defaultReservation.images.split(',')[0];
                    }
					$('#' + view.reservationBlockID).append(yourReservationsItemTemplate(defaultReservation));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}

			});
		}
	}
);