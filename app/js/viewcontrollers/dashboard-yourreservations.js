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

			populateYourReservations,

			handleDenied,
			handleRental;

		reservationBlockID = 'yourreservations-gear-block';

		didInitialize = function() {
			var view = this;
			gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			gearList.getUserReservations(App.user.data.id, function (data) {
				if(data.length !== 0){
					view.populateYourReservations();
				}
				else {
					$('#yourreservations-gear-block').append('You don\'t have any reservations!');
				}
				view.render();
			});
		};

		didRender = function() {
			var view = this;
			view.setupEvent('click', '.yourgear-status.denied', view, view.handleDenied);
            view.setupEvent('click', '.yourgear-status.in-rental', view, view.handleRental);
		};

		populateYourReservations = function(callback) {
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

                    if(defaultReservation.booking_status === 'pending') {
                    	defaultReservation.gear_status = '<span class="yourgear-status pending">PENDING</span>';
                    }
                    else if(defaultReservation.booking_status === 'denied') {
                    	defaultReservation.gear_status = '<button class="btn btn-warning yourgear-status denied" data-gearid="' + reservation.data.id + '">DENIED</button>';
                    }
                    else if(defaultReservation.gear_status === 'rented-out') {
                    	defaultReservation.gear_status = '<button class="btn btn-default yourgear-status in-rental" data-gearid="' + reservation.data.id + '">IN RENTAL</button>';
                    }
                    else if(defaultReservation.booking_status === 'accepted') {
                    	defaultReservation.gear_status = '<span class="yourgear-status accepted">ACCEPTED</span>';
                    }

					$('#' + reservationBlockID).append(yourReservationsItemTemplate(defaultReservation));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		handleDenied = function() {
			var gear;
			gear = gearList.getGearItem($(this).data('gearid'));
			App.router.openModalView('booking', gear);
		};

		handleRental = function() {
			var gear;
			gear = gearList.getGearItem($(this).data('gearid'));
			App.router.openModalView('booking', gear);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourReservations: populateYourReservations,
			handleDenied: handleDenied,
			handleRental: handleRental
		});
	}
);