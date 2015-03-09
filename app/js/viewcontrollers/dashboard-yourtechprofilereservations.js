/**
 * Controller for the Sharingear Your Tech Profile reservations page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'app', 'models/techprofilelist'],
	function(_, $, Config, ViewController, App, TechProfileList) {
		var reservationBlockID,

			didInitialize,
			didRender,

			populateYourReservations,

			handleBooking;

		reservationBlockID = 'yourreservations-techprofile-block';

		didInitialize = function() {
			var view = this;
			view.techProfileList = new TechProfileList.constructor({
				rootURL: Config.API_URL
			});
			view.techProfileList.initialize();
			view.techProfileList.getUserTechProfileReservations(App.user.data.id, function () {
				view.didFetch = true;
				view.render();
			});
		};

		didRender = function() {
			App.header.setTitle('Tech profile reservations');
			if(this.didFetch === true) {
				this.populateYourReservations();
			}

			this.setupEvent('click', '#yourreservations-techprofile-block .sg-list-item button', this, this.handleBooking);
		};

		populateYourReservations = function(callback) {
			var view = this;
			require(['text!../templates/yourtechprofilereservations-item.html'], function(YourReservationsItemTemplate) {
				var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
					yourReserv = view.techProfileList.data,
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
                        roadie_type: '',
						start_date:'',
                        start_time:'',
						end_date:'',
                        end_time:'',
                        model: '',
                        images:'',
                        img_url: 'images/placeholder_grey.png',
                        price: 0,
                        city: ''
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
					if(status === 'denied' || status==='ended-denied') {
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
				techProfile, passedData;
			techProfile = view.techProfileList.getTechProfileItem('booking_id', bookingID);
			passedData = {
				techprofile: techProfile.data.roadie_type,
				techprofile_id: techProfile.data.id,
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
