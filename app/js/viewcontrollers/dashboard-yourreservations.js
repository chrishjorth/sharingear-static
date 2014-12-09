/**
 * Controller for the Sharingear Your reservations page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, $, ViewController, App, GearList) {
		var reservationBlockID,

			didInitialize,
			didRender,

			populateYourReservations,

			handleDenied,
			handleRental;

		reservationBlockID = 'yourreservations-gear-block';

		didInitialize = function() {
			var view = this;
			view.gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			view.gearList.getUserReservations(App.user.data.id, function (data) {
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
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					yourReserv = view.gearList.data,
                    defaultReservation, reservation, i;

				for(i = 0; i < yourReserv.length; i++) {
                    defaultReservation = {
                        id: null,
                        gear_type: '',
                        subtype: '',
                        brand: '',
                        start_time:'',
                        end_time:'',
                        model: '',
                        images:'',
                        img_url: 'images/placeholder_grey.png',
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
                    	defaultReservation.gear_status = '<button class="btn btn-warning yourgear-status denied" data-bookingid="' + reservation.data.booking_id + '">DENIED</button>';
                    }
                    else if(defaultReservation.gear_status === 'rented-out') {
                    	defaultReservation.gear_status = '<button class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">IN RENTAL</button>';
                    }
                    else if(defaultReservation.booking_status === 'accepted') {
                    	defaultReservation.gear_status = '<button class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">ACCEPTED</button>';
                    }
                    else if(defaultReservation.booking_status === 'renter-returned') {
                    	defaultReservation.gear_status = '<button class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">WAITING FOR OWNER</button>';
                    }
                    else if(defaultReservation.booking_status === 'owner-returned') {
                    	defaultReservation.gear_status = '<button class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">WAITING FOR RENTER</button>';
                    }
                    else if(defaultReservation.booking_status === 'ended') {
                    	defaultReservation.gear_status = '<span class="yourgear-status pending">ENDED</span>';
                    }
                    else {
                    	defaultReservation.gear_status = '<span class="yourgear-status pending">FAILED</span>';
                    }

					$('#' + reservationBlockID).append(yourReservationsItemTemplate(defaultReservation));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		handleDenied = function(event) {
			var view = event.data,
				gear;
			gear = view.gearList.getGearItem('booking_id', $(this).data('bookingid'));
			App.router.openModalView('booking', gear);
		};

		handleRental = function(event) {
			var view = event.data,
				gear;
			gear = view.gearList.getGearItem('booking_id', $(this).data('bookingid'));
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