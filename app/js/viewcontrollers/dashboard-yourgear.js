/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller', 'app', 'models/gearlist'],
	function(_, Utilities, ViewController, App, GearList) {
		var YourGear = Utilities.inherit(ViewController, {
			gearBlockID: 'yourgear-gear-block',
			gearList: new GearList({
				rootURL: App.API_URL
			}),
			
			didRender: didRender,
			populateYourGear: populateYourGear,
			setupEvents: setupEvents,
			handleEditGearItem: handleEditGearItem
		}); 
		return YourGear;

		function didRender() {
			var view = this;

			this.gearList.getUserGear(App.user.data.id, function(userGear) {
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
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: '',
					description: '',
					photos: '',
					price: 0,
					seller_user_id: 0,
					city: '',
					address: '',
					country: '',
					price1: 0,
					price2: 0,
					price3: 0
				};

				for(i = 0; i < yourGear.length; i++) {
					gear = yourGear[i];
					_.extend(defaultGear, gear);
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
			App.router.openModalView('editgear');
		}
	}
);