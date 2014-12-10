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
						start_date:'',
                        start_time:'',
						end_date:'',
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
					var startdate = defaultReservation.start_time.split(' ')[0];
					var starttime = defaultReservation.start_time.split(' ')[1].slice(0,-3);

					var enddate = defaultReservation.end_time.split(' ')[0];
					var endtime = defaultReservation.end_time.split(' ')[1].slice(0,-3);

					defaultReservation.start_time=starttime;
					defaultReservation.start_date=startdate;

					defaultReservation.end_time=endtime;
					defaultReservation.end_date=enddate;

                    if(defaultReservation.booking_status === 'pending') {
                    	defaultReservation.gear_status = '<div class="yourgear-status pending" style="background-color: #EE0000;border: 0;height: 100%;width: 100%;margin: 0px;padding: 0px;">PENDING</div>';
                    }
                    else if(defaultReservation.booking_status === 'denied') {
                    	defaultReservation.gear_status = '<button style="background-color: #EE0000;border: 0;width: 100%;margin: 0px;padding: 0px;height: 30px;color: white;font-weight: bold;" class="btn btn-warning yourgear-status denied" data-bookingid="' + reservation.data.booking_id + '">DENIED</button>';
                    }
                    else if(defaultReservation.gear_status === 'rented-out') {
                    	defaultReservation.gear_status = '<button style="background-color: #fcd700;border: 0;width: 100%;margin: 0px;padding: 0px;height: 30px;color: white;font-weight: bold;" class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">IN RENTAL</button>';
                    }
                    else if(defaultReservation.booking_status === 'accepted') {
                    	defaultReservation.gear_status = '<button style="background-color: #71d800;border: 0;width: 100%;margin: 0px;padding: 0px;height: 30px;color: white;font-weight: bold;" class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">ACCEPTED</button>';
                    }
                    else if(defaultReservation.booking_status === 'renter-returned') {
                    	defaultReservation.gear_status = '<button style="background-color: #00aeff;border: 0;width: 100%;margin: 0px;padding: 0px;height: 30px;color: white;font-weight: bold;" class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">AWAIT OWNER</button>';
                    }
                    else if(defaultReservation.booking_status === 'owner-returned') {
                    	defaultReservation.gear_status = '<button style="background-color: #00aeff;border: 0;width: 100%;margin: 0px;padding: 0px;height: 30px;color: white;font-weight: bold;" class="btn btn-default yourgear-status in-rental" data-bookingid="' + reservation.data.booking_id + '">AWAIT RENTER</button>';
                    }
                    else if(defaultReservation.booking_status === 'ended') {
                    	defaultReservation.gear_status = '<div class="yourgear-status pending" style="background-color: #EE0000;border: 0;height: 100%;width: 100%;margin: 0px;padding: 0px;">ENDED</div>';
                    }
                    else {
                    	defaultReservation.gear_status = '<div style="background-color: #EE0000;border: 0;height: 100%;width: 100%;margin: 0px;padding: 0px;" class="yourgear-status pending">FAILED</div>';
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