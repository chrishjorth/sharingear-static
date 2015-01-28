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
			view.gearList.initialize();
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

			App.header.setTitle('Gear reservations');

			var view = this;
			view.setupEvent('click', '.yourgear-status.denied', view, view.handleDenied);
            view.setupEvent('click', '.yourgear-status.in-rental', view, view.handleRental);
		};

		populateYourReservations = function(callback) {
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					yourReserv = view.gearList.data,
					$reservationBlock, defaultReservation, reservation, i, $reservationItem, status;

				$reservationBlock = $('#' + reservationBlockID, view.$element);

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

					$reservationItem = $(yourReservationsItemTemplate(defaultReservation));
					$('.sg-bg-image', $reservationItem).css({
						'background-image': 'url("' + defaultReservation.img_url + '")'
					});

					status = reservation.data.booking_status;
					console.log('status: ' + status);
					if(status === 'pending' || status === 'waiting') {
						$('.request', $reservationItem).removeClass('hidden');
					}
					if(status === 'accepted' || status === 'rented-out' || status === 'renter-returned' || status === 'owner-returned' || status === 'ended') {
						$('.accepted', $reservationItem).removeClass('hidden');
					}
					if(status === 'denied') {
						$('.denied', $reservationItem).removeClass('hidden');
					}

					$reservationBlock.append($reservationItem);

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
