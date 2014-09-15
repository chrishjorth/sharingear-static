/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, ViewController, App, GearList) {
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
					defaultGear, gear;

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
					owner_id: null
				};

				for(i = 0; i < yourGear.length; i++) {
					gear = yourGear[i];
					_.extend(defaultGear, gear);
					if(gear.images.length > 0) {
						defaultGear.img_url = gear.images.split(',')[0];
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
			var view = event.data;
			App.router.openModalView('editgear', view.gearList.getGearItem($(this).data('yourgearid')));
		}
	}
);