/**
 * Controller for the Sharingear Your rentals dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, $, ViewController, App, GearList) {
		var gearBlockID,

			didInitialize,
			didRender,
			populateYourRentals,

			handleGearItemPendConfirm,
			handleEditGearItem,
			handleGearItemAvailability,
			handleBooking;

		gearBlockID = 'yourrentals-gear-block';

		didInitialize = function() {
			var view = this;

			this.didFetch = false;
			this.gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			this.gearList.initialize();
			this.gearList.getUserRentals(App.user.data.id, function() {
				view.didFetch = true;
				view.render();
			});
		};

		didRender = function() {

			App.header.setTitle('Gear rentals');

			if(this.didFetch === true) {
				this.populateYourRentals();
			}
		};

		populateYourRentals = function(callback) {
			var view = this;
			require(['text!../templates/yourrentals-item.html'], function(YourRentalsItemTemplate) {
				var yourRentalsItemTemplate = _.template(YourRentalsItemTemplate),
					yourRentals = view.gearList.data,
					$gearBlock, defaultGear, gear, i, $gearItem;

				if(yourRentals.length <= 0) {
					$('#' + gearBlockID, view.$element).append('You currently do not have any rentals.');
					if(callback && typeof callback === 'function') {
						callback();
					}
					return;
				}

				$gearBlock = $('#' + gearBlockID, view.$element);

				for(i = 0; i < yourRentals.length; i++) {
					defaultGear = {
						id: null,
						gear_type: '',
						subtype: '',
						brand: '',
						model: '',
						description: '',
						img_url: 'images/placeholder_grey.png',
						price_a: 0,
						price_b: 0,
						price_c: 0,
						owner_id: null,
                        gear_status : 'unavailable'
					};

					gear = yourRentals[i];
					_.extend(defaultGear, gear.data);
					if(defaultGear.images.length > 0) {
						defaultGear.img_url = defaultGear.images.split(',')[0];
					}
					$gearItem = $(yourRentalsItemTemplate(defaultGear));
					$('.sg-bg-image' ,$gearItem).css({
						'background-image': 'url("' + defaultGear.img_url + '")'
					});


                    if(gear.data.booking_status === 'pending') {
                        defaultGear.gear_status = '<button class="btn btn-warning yourrentals-status pending" data-yourgear-bookingid="' + gear.data.booking_id + '">' + 'PENDING' + '</button>';
                    }
                    else if(gear.data.gear_status === 'rented-out' || gear.data.booking_status === 'renter-returned' || gear.data.booking_status === 'owner-returned') {
                    	defaultGear.gear_status = '<button class="btn btn-default yourrentals-status booking-btn" data-yourgear-bookingid="' + gear.data.booking_id + '">' + 'RENTED OUT' + '</button>';
                    }
                    else if(gear.data.booking_status === 'accepted') {
                    	defaultGear.gear_status = '<button class="btn btn-default yourrentals-status booking-btn" data-yourgear-bookingid="' + gear.data.booking_id + '">' + 'ACCEPTED' + '</button>';
                    }
                    else if(gear.data.booking_status === 'ended') {
                    	defaultGear.gear_status = 'ended';
                    }
                    else {
                    	defaultGear.gear_status = 'failed';
                    }
					$gearBlock.append($gearItem);
				}

				view.setupEvent('click', '.yourrentals-status.pending', view, view.handleGearItemPendConfirm);
				view.setupEvent('click', '.booking-btn', view, view.handleBooking);

				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

        handleGearItemPendConfirm = function(event){
            var view = event.data,
            	bookingID = $(this).data('yourgearBookingid'),
                gear;
            gear = view.gearList.getGearItem('booking_id', bookingID);
            App.router.openModalView('booking', gear);
        };

		handleBooking = function(event) {
			var view = event.data,
				bookingID = $(this).data('yourgearBookingid'),
				gear;
			gear = view.gearList.getGearItem('booking_id', bookingID);
			App.router.openModalView('booking', gear);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourRentals: populateYourRentals,

			handleEditGearItem: handleEditGearItem,
			handleGearItemAvailability: handleGearItemAvailability,
            handleGearItemPendConfirm : handleGearItemPendConfirm,
            handleBooking: handleBooking
		});
	}
);
