/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {
		var YourGear = Utilities.inherit(ViewController, {
			gearBlockID: 'yourgear-gear-block',
			
			didRender: didRender,
			populateYourGear: populateYourGear
		}); 
		return YourGear;

		function didRender() {
			var yourGear = [{
				id: 0,
				type: 0,
				subtype: 0,
				brand: 0,
				model: 'Gibson Guitar',
				description: 'blah blah',
				photos: 'url,url,url',
				price: 100.5,
				seller_user_id: 0,
				city: 'Copenhagen',
				address: '',
				price1: 4,
				price2: 15,
				price3: 75
			}, {
				id: 0,
				type: 0,
				subtype: 0,
				brand: 0,
				model: 'Gibson Guitar',
				description: 'blah blah',
				photos: 'url,url,url',
				price: 100.5,
				seller_user_id: 0,
				city: 'Copenhagen',
				address: '',
				price1: 4,
				price2: 15,
				price3: 75
			}, {
				id: 0,
				type: 0,
				subtype: 0,
				brand: 0,
				model: 'Gibson Guitar',
				description: 'blah blah',
				photos: 'url,url,url',
				price: 100.5,
				seller_user_id: 0,
				city: 'Copenhagen',
				address: '',
				price1: 4,
				price2: 15,
				price3: 75
			}];

			this.populateYourGear(yourGear);
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
	}
);