/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gearlist', 'models/gear'],
	function(_, ViewController, App, GearList, Gear) {
		var YourGear = ViewController.inherit({
			gearBlockID: 'yourgear-gear-block',
			gearList: new GearList.constructor({
				rootURL: App.API_URL,
				data: []
			}),
			
			didRender: didRender,
			populateYourGear: populateYourGear,
			setupEvents: setupEvents,
			handleEditGearItem: handleEditGearItem
		}); 
		return YourGear;

		function didRender() {
			var view = this,
				userID = null;

			if(App.user.data && App.user.data.id) {
				userID = App.user.data.id;
			}
			this.gearList.getUserGear(userID, function(userGear) {
				view.populateYourGear(userGear);
				view.setupEvents();
			});
		}

		function populateYourGear(yourGear, callback) {
			var view = this;
			require(['text!../templates/yourgear-item.html'], function(YourGearItemTemplate) {
				var yourGearItemTemplate = _.template(YourGearItemTemplate),
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
                        status : 'Unavailable'
					};
					gear = yourGear[i];
					_.extend(defaultGear, gear);
					if(gear.images.length > 0) {
						defaultGear.img_url = gear.images.split(',')[0];
					}

                    // gear status (returns: 'unavailable', 'available', 'pending', 'rented')
                    if(gear.status){

                        defaultGear.status = gear.status == 'pending' ?
                                                    '<button class="btn btn-warning yourgear-status ' + gear.status +'">' + gear.status + '</button>'
                                                    : '<span class="yourgear-status ' + gear.status +'">' + gear.status + '</span>';

                    }
					$('#' + view.gearBlockID).append(yourGearItemTemplate(defaultGear));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function setupEvents() {
			this.setupEvent('click', '.yourgear-item .btn-edit', this, this.handleEditGearItem);
		}

		function handleEditGearItem(event) {
			var view = event.data,
				gear;
			gear = new Gear.constructor({
				rootURL: App.API_URL,
				data: view.gearList.getGearItem($(this).data('yourgearid'))
			});
			App.router.openModalView('editgear', gear);
		}
	}
);