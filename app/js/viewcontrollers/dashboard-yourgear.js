/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, $, ViewController, App, GearList) {
		var gearBlockID,

			didInitialize,
			didRender,
			populateYourGear,
			setupEvents,
			handleEditGearItem;

		gearBlockID = 'yourgear-gear-block';

		didInitialize = function() {
			var view = this;
			view.gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			view.gearList.initialize();
			view.gearList.getUserGear(App.user.data.id, function(userGear) {
				if(userGear.length > 0) {
					view.populateYourGear();
				}
				else {
					$('#yourgear-gear-block').append('You haven\'t listed any gear yet!');
				}
				view.render();
			});
		};

		didRender = function() {
			App.header.setTitle('Your gear');

			this.setupEvent('click', '.yourgear-item-edit-btn', this, this.handleEditGearItem);
		};

		populateYourGear = function(callback) {
			var view = this;
			require(['text!../templates/yourgear-item.html'], function(YourGearItemTemplate) {
				var yourGearItemTemplate = _.template(YourGearItemTemplate),
					yourGear = view.gearList.data,
					$gearBlock, defaultGear, gear, i, $gearItem;

				$gearBlock = $('#' + gearBlockID, view.$element);

				for(i = 0; i < yourGear.length; i++) {
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

					gear = yourGear[i];
					_.extend(defaultGear, gear.data);
					if(defaultGear.images.length > 0) {
						defaultGear.img_url = defaultGear.images.split(',')[0];
					}
					$gearItem = $(yourGearItemTemplate(defaultGear));
					$('.sg-bg-image' ,$gearItem).css({
						'background-image': 'url("' + defaultGear.img_url + '")'
					});
					$gearBlock.append($gearItem);
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		handleEditGearItem = function(event) {
			var view = event.data,
				gear;
			gear = view.gearList.getGearItem('id', $(this).data('yourgearid'));
			App.router.openModalView('editgear', gear);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourGear: populateYourGear,
			setupEvents: setupEvents,
			handleEditGearItem: handleEditGearItem
		}); 
	}
);