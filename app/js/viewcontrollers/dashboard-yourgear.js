/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, $, ViewController, App, GearList) {
		var gearBlockID,
			gearList,

			didInitialize,
			didRender,
			populateYourGear,
			setupEvents,
			handleGearItemPendConfirm,
			handleEditGearItem,
			handleGearItemAvailability,
			handleBooking;

		gearBlockID = 'yourgear-gear-block';

		didInitialize = function() {
			var view = this;
			gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			gearList.getUserGear(App.user.data.id, function(userGear) {
				if(userGear.length!==0) {
					view.populateYourGear();
				}
				else {
					$('#yourgear-gear-block').append('You haven\'t listed any gear yet!');
				}
				view.render();
			});
		};

		didRender = function() {
			this.setupEvent('click', '.yourgear-item .btn-edit', this, this.handleEditGearItem);
			this.setupEvent('click', '.yourgear-item .btn-availability', this, this.handleGearItemAvailability);
			this.setupEvent('click', '.yourgear-status.pending', this, this.handleGearItemPendConfirm);
			this.setupEvent('click', '.booking-btn', this, this.handleBooking);
		};

		populateYourGear = function(callback) {
			var view = this;
			require(['text!../templates/yourgear-item.html'], function(YourGearItemTemplate) {
				var yourGearItemTemplate = _.template(YourGearItemTemplate),
					yourGear = gearList.data,
					defaultGear, gear, i;

				for(i = 0; i < yourGear.length; i++) {
					defaultGear = {
						id: null,
						type: '',
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

					gear = yourGear[i];
					_.extend(defaultGear, gear.data);
					if(defaultGear.images.length > 0) {
						defaultGear.img_url = defaultGear.images.split(',')[0];
					}

                    if(gear.data.booking_status === 'pending') {
                        defaultGear.gear_status = '<button class="btn btn-warning yourgear-status pending" data-yourgearid="' + gear.data.id + '">' + 'PENDING' + '</button>';
                    }
                    else if(gear.data.gear_status === 'rented-out' || gear.data.gear_status === 'renter-returned' || gear.data.gear_status === 'owner-returned') {
                    	defaultGear.gear_status = '<button class="btn btn-default yourgear-status booking-btn" data-yourgearid="' + gear.data.id + '">' + 'RENTED OUT' + '</button>';
                    }
                    else {
                    	defaultGear.gear_status = '';
                    }

					$('#' + gearBlockID).append(yourGearItemTemplate(defaultGear));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

        handleGearItemPendConfirm = function(event){
            var view = event.data,
                gear;
            gear = gearList.getGearItem($(this).data('yourgearid'));
            App.router.openModalView('booking', gear);
        };

		handleEditGearItem = function(event) {
			var view = event.data,
				gear;
			gear = gearList.getGearItem($(this).data('yourgearid'));
			App.router.openModalView('editgear', gear);
		};

		handleGearItemAvailability = function(event) {
			var view = event.data,
				gear;
			gear = gearList.getGearItem($(this).data('yourgearid'));

			if(App.user.isSubMerchant() === true) {
				App.router.openModalView('gearavailability', gear);
			}
			else {
				App.router.openModalView('submerchantregistration', gear);
			}
		};

		handleBooking = function() {
			var gear;
			gear = gearList.getGearItem($(this).data('yourgearid'));
			App.router.openModalView('booking', gear);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourGear: populateYourGear,
			setupEvents: setupEvents,
			handleEditGearItem: handleEditGearItem,
			handleGearItemAvailability: handleGearItemAvailability,
            handleGearItemPendConfirm : handleGearItemPendConfirm,
            handleBooking: handleBooking
		}); 
	}
);