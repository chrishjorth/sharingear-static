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

			handleBooking;

		reservationBlockID = 'yourreservations-gear-block';

		didInitialize = function() {
			var view = this;
			view.gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			view.gearList.initialize();
			view.gearList.getUserReservations(App.user.data.id, function () {
				view.didFetch = true;
				view.render();
			});
		};

		didRender = function() {
			App.header.setTitle('Gear reservations');

			if(this.didFetch === true) {
				this.populateYourReservations();
			}

			this.setupEvent('click', '#yourreservations-gear-block .sg-list-item button', this, this.handleBooking);
		};

		populateYourReservations = function(callback) {
			var view = this;
			require(['text!../templates/yourreservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					yourReserv = view.gearList.data,
					$reservationBlock, defaultReservation, reservation, i, $reservationItem, status;

				if(yourReserv.length <= 0) {
					$('#' + reservationBlockID, view.$element).append('You currently do not have any reservations.');
					if(callback && typeof callback === 'function') {
						callback();
					}
					return;
				}

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

		handleBooking = function(event) {
			var view = event.data,
				bookingID = $(this).data('bookingid'),
				passedData;
			passedData = {
				gear: view.gearList.getGearItem('booking_id', bookingID),
				mode: 'renter',
				booking_id: bookingID
			};
			App.router.openModalView('booking', passedData);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourReservations: populateYourReservations,
			handleBooking: handleBooking
		});
	}
);
