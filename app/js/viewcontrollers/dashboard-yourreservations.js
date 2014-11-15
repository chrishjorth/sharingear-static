/**
 * Controller for the Sharingear Your reservations page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, $, ViewController, App, GearList) {
		var reservationBlockID,
			gearList,

			didInitialize,
			didRender,
			populateYourReservations;

		reservationBlockID = 'yourreservations-gear-block';

		didInitialize = function() {
			gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
		};

		didRender = function() {
			var view = this,
				userID = App.user.data.id;

            if(gearList.isEmpty()) {
                gearList.getUserReservations(userID, function (data) {
                    if(data.length !== 0){
                        view.populateYourReservations();
                    }
                    else {
                        $('#yourreservations-gear-block').append('You don\'t have any reservations!');
                    }
                });
            }else{
                view.populateYourReservations();
            }
		};

		populateYourReservations = function(callback) {
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					yourReserv = gearList.data,
                    defaultReservation, reservation, i;

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
                    defaultReservation.gear_status = '<span class="yourgear-status ' + defaultReservation.gear_status +'">' + defaultReservation.gear_status + '</span>';

					$('#' + reservationBlockID).append(yourReservationsItemTemplate(defaultReservation));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourReservations: populateYourReservations
		});
	}
);