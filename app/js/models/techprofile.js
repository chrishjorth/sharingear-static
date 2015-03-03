/**
 * Defines a tech profile item.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'model', 'app'],
	function(_, Utilities, Model, App) {
		var didInitialize,
			createTechProfile,
			save,
			update,
			getAvailability,
			setAvailability; 

		didInitialize = function didInitialize() {
			if(this.data === null) {
				this.data = {
					id: null,
					roadie_type: '',
					model: '',
					description: '',
					images: '',
					price_a: '',
					price_b: '',
					price_c: '',
					currency: App.user.data.currency,
					accessories: null,
					address: '',
					postal_code: '',
					city: '',
					region: '',
					country: '',
					latitude: null,
					longitude: null,
					owner_id: null
				};
			}
		};

		createTechProfile = function createGear(callback) {
			var model = this,
				newTechProfile = this.data,
				postData;

			postData = {
				roadie_type: newTechProfile.roadie_type,
				price_a: newTechProfile.price_a,
				price_b: newTechProfile.price_b,
				price_c: newTechProfile.price_c,
				currency: newTechProfile.currency,
				address: newTechProfile.address,
				postal_code: newTechProfile.postal_code,
				city: newTechProfile.city,
				region: newTechProfile.region,
				country: newTechProfile.country,
				latitude: newTechProfile.latitude,
				longitude: newTechProfile.longitude,
				owner_id: App.user.data.id
			};
			
			this.post('/users/' + App.user.data.id + '/roadies', postData, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback(error);
					}
					return;
				}
				_.extend(model.data, data);
				if(callback && typeof callback === 'function') {
					callback(null);
				}
			});
		};

		save = function(callback) {
			var saveData = {
				price_a: this.data.price_a,
				price_b: this.data.price_b,
				price_c: this.data.price_c,
				currency: this.data.currency,
				address: this.data.address,
				postal_code: this.data.postal_code,
				city: this.data.city,
				region: this.data.region,
				country: this.data.country,
				latitude: this.data.latitude,
				longitude: this.data.longitude,
			};

			this.put('/users/' + App.user.data.id + '/roadies/' + this.data.id, saveData, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback('Error saving gear: ' + error);
					}
					return;
				}

				if(callback && typeof callback === 'function') {
					callback(null, data);
				}
			});
		};

		update = function(userID, callback) {
			var model = this;
			this.get('/roadies/' + this.data.id, function(error, techProfile) {
				if(error) {
					console.log(error);
					callback(error);
					return;
				}
				_.extend(model.data, techProfile);
				callback(null);
			});
		};

		getAvailability = function(callback) {
			if(App.user.data.id === null) {
				callback(null, {
					alwaysFlag: 0,
					availabilityArray: []
				});
				return;
			}
			this.get('/users/' + App.user.data.id + '/roadies/' + this.data.id + '/availability', function(error, result) {
				if(error) {
					console.log(error);
					callback(error);
					return;
				}
				callback(null, result);
			});
		};

		/**
		 * @param availabilityArray: List of start and end days in the format "YYYY-MM-DD HH:MM:SS".
		 */
		setAvailability = function(availabilityArray, alwaysFlag, callback) {
			var postData;
			postData = {
				availability: JSON.stringify(availabilityArray),
				alwaysFlag: alwaysFlag
			};
			this.post('/users/' + App.user.data.id + '/roadies/' + this.data.id + '/availability', postData, function(error) {
				if(error) {
					console.log(error);
					callback(error);
					return;
				}
				callback(null);
			});
		};

		return Model.inherit({
			didInitialize: didInitialize,
			createTechProfile: createTechProfile,
			save: save,
			update: update,
            getAvailability: getAvailability,
            setAvailability: setAvailability
		});
	}
);
