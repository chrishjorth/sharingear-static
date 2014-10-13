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
			var view = this;

			if(this.gearList.isEmpty()) {
				this.gearList.getUserGear(App.user.data.id, function(userGear) {
					view.populateYourGear();
					view.setupEvents();
				});
			}
			else {
				this.populateYourGear();
				this.setupEvents();
			}
		}

		function populateYourGear(callback) {
			var view = this;
			require(['text!../templates/yourgear-item.html'], function(YourGearItemTemplate) {
				var yourGearItemTemplate = _.template(YourGearItemTemplate),
					yourGear = view.gearList.data,
					defaultGear, gear;

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
						owner_id: null
					};
					gear = yourGear[i];
					_.extend(defaultGear, gear.data);
					if(defaultGear.images.length > 0) {
						defaultGear.img_url = defaultGear.images.split(',')[0];
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
			gear = view.gearList.getGearItem($(this).data('yourgearid'));
			App.router.openModalView('editgear', gear);
		}
	}
);