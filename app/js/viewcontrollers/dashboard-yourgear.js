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
			handleGearItemAvailability;

		gearBlockID = 'yourgear-gear-block';

		didInitialize = function() {
			gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
		};

		didRender = function() {
			var view = this;

			if(gearList.isEmpty()) {
				gearList.getUserGear(App.user.data.id, function(userGear) {
                    if(userGear.length!==0) {
                        view.populateYourGear();
                        view.setupEvents();
                    }
                    else {
                        $('#yourgear-gear-block').append('You haven\'t listed any gear yet!');
                    }
				});
			}
			else {
				this.populateYourGear();
				this.setupEvents();
			}
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
						img_url: 'images/logotop.png',
						price_a: 0,
						price_b: 0,
						price_c: 0,
						owner_id: null,
                        gear_status : 'unavailable'
					};

					gear = yourGear[i];
					console.log(gear.data);
					_.extend(defaultGear, gear.data);
					if(defaultGear.images.length > 0) {
						defaultGear.img_url = defaultGear.images.split(',')[0];
					}
                    // gear status (returns: 'unavailable', 'available', 'pending', 'rented')

                    if(gear.data.booking_status === 'pending') {
                        defaultGear.gear_status = '<button class="btn btn-warning yourgear-status pending" data-yourgearid="' + gear.data.id + '">' + 'PENDING' + '</button>';
                    }
                    else if(gear.data.gear_status === 'rented-out' || gear.data.gear_status === 'renter-returned' || gear.data.gear_status === 'owner-returned') {
                    	defaultGear.gear_status = '<span class="yourgear-status ' + gear.data.gear_status +'" data-yourgearid="' + gear.data.id + '">' + 'RENTED OUT' + '</span>';
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

		setupEvents = function() {
			this.setupEvent('click', '.yourgear-item .btn-edit', this, this.handleEditGearItem);
			this.setupEvent('click', '.yourgear-item .btn-availability', this, this.handleGearItemAvailability);
			this.setupEvent('click', '.yourgear-status.pending', this, this.handleGearItemPendConfirm);
		};

        handleGearItemPendConfirm = function(event){

            var view = event.data,
                gear;

            gear = view.gearList.getGearItem($(this).data('yourgearid'));
            App.router.openModalView('gearpendingconfirm', gear);
        };

		handleEditGearItem = function(event) {
			var view = event.data,
				gear;
			gear = view.gearList.getGearItem($(this).data('yourgearid'));
			App.router.openModalView('editgear', gear);
		};

		handleGearItemAvailability = function(event) {
			var view = event.data,
				gear;
			gear = view.gearList.getGearItem($(this).data('yourgearid'));

			if(App.user.isSubMerchant() === true) {
				App.router.openModalView('gearavailability', gear);
			}
			else {
				App.router.openModalView('submerchantregistration', gear);
			}
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourGear: populateYourGear,
			setupEvents: setupEvents,
			handleEditGearItem: handleEditGearItem,
			handleGearItemAvailability: handleGearItemAvailability,
            handleGearItemPendConfirm : handleGearItemPendConfirm

		}); 
	}
);