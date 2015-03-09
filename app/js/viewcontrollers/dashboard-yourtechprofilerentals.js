/**
 * Controller for the Sharingear Your Tech Profile rentals dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'app', 'models/techprofilelist'],
	function(_, $, Config, ViewController, App, TechProfileList) {
		var techProfileBlockID,

			didInitialize,
			didRender,
			populateYourRentals,

			handleBooking;

		techProfileBlockID = 'yourrentals-techprofile-block';

		didInitialize = function() {
			var view = this;

			this.didFetch = false;
			this.techProfileList = new TechProfileList.constructor({
				rootURL: Config.API_URL
			});
			this.techProfileList.initialize();
			this.techProfileList.getUserTechProfileRentals(App.user.data.id, function() {
				view.didFetch = true;
				view.render();
			});
		};

		didRender = function() {
			App.header.setTitle('Tech profile rentals');

			if(this.didFetch === true) {
				this.populateYourRentals();
			}

			this.setupEvent('click', '#yourrentals-techprofile-block .sg-list-item button', this, this.handleBooking);
		};

		populateYourRentals = function(callback) {
			var view = this;
			require(['text!../templates/yourtechprofilerentals-item.html'], function(YourRentalsItemTemplate) {
				var yourRentalsItemTemplate = _.template(YourRentalsItemTemplate),
					yourRentals = view.techProfileList.data,
					displayedRentals = 0, //We do not display rentals with status waiting
					$techProfileBlock, defaultTechProfile, techProfile, i, $techProfileItem, status;

				$techProfileBlock = $('#' + techProfileBlockID, view.$element);

				for(i = 0; i < yourRentals.length; i++) {
					defaultTechProfile = {
						id: null,
						roadie_type: '',
						subtype: '',
						brand: '',
						model: '',
						description: '',
						img_url: 'images/placeholder_grey.png',
						price_a: 0,
						price_b: 0,
						price_c: 0,
						owner_id: null
					};

					techProfile = yourRentals[i];
					_.extend(defaultTechProfile, techProfile.data);
					
					defaultTechProfile.img_url = defaultTechProfile.image_url;
					
					$techProfileItem = $(yourRentalsItemTemplate(defaultTechProfile));
					$('.sg-bg-image', $techProfileItem).css({
						'background-image': 'url("' + defaultTechProfile.img_url + '")'
					});


					status = techProfile.data.booking_status;
					if(status !== 'waiting') {
						if(status === 'pending') {
							$('.request', $techProfileItem).removeClass('hidden');
						}
						if(status === 'accepted' || status === 'rented-out' || status === 'renter-returned' || status === 'owner-returned' || status === 'ended') {
							$('.accepted', $techProfileItem).removeClass('hidden');
						}
						if(status === 'denied') {
							$('.denied', $techProfileItem).removeClass('hidden');
						}
                    
						$techProfileBlock.append($techProfileItem);
						displayedRentals++;
					}
				}

				if(displayedRentals <= 0) {
					$('#' + techProfileBlockID, view.$element).append('You currently do not have any rentals.');
				}
				else {
					view.setupEvent('click', '.booking-btn', view, view.handleBooking);
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
				techProfile: techProfile.data.roadie_type,
				techprofile_id: techProfile.data.id,
				mode: 'owner',
				booking_id: bookingID
			};
			App.router.openModalView('booking', passedData);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourRentals: populateYourRentals,

            handleBooking: handleBooking
		});
	}
);
