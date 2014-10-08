/**
 * Defines a gear item.
 * @author: Chris Hjorth
 */
define(
	['utilities', 'model'],
	function(Utilities, Model) {
		var Gear = Model.inherit({
			data: {
				id: null,
				type: '',
				subtype: '',
				brand: '',
				model: '',
				description: '',
				images: '',
				price_a: '',
				price_b: '',
				price_c: '',
				address: '',
				postalcode: '',
				city: '',
				region: '',
				country: '',
				latitude: null,
				longitude: null,
				owner_id: null
			},
			createGear: createGear,
			uploadImage: uploadImage,
			save: save,
			update: update
		});

		return Gear;

		function createGear(user, callback) {
			var model = this,
				newGear = this.data,
				postData;

			postData = {
				type: newGear.type,
				subtype: newGear.subtype,
				brand: newGear.brand,
				model: newGear.model,
				decription: newGear.description,
				images: newGear.images,
				price_a: newGear.price_a,
				price_b: newGear.price_b,
				price_c: newGear.price_c,
				address: newGear.address,
				postalcode: newGear.postalcode,
				city: newGear.city,
				region: newGear.region,
				country: newGear.country,
				latitude: newGear.latitude,
				longitude: newGear.longitude,
				owner_id: user.data.id
			};
			this.post('/gear', postData, function(error, data) {
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
		}

		/**
		 * @param file: $('#upload-form input[type="file"]').get(0).files[0];
		 * @param filename: The name of the file
		 */
		function uploadImage(file, filename, userID, callback) {
			var model = this;
			//Get filename and secret from backend
			this.get('/users/' + userID + '/newfilename/' + filename, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback('Error getting filename: ' + error);
					}
					return;
				}
				Utilities.ajajFileUpload('fileupload.php', data.secretProof, data.fileName, file, function(error, data) {
					var postData;
					if(error) {
						if(callback && typeof callback === 'function') {
							callback('Error uploading file: ' + error);
						}
						return;
					}
					//Add image url to backend
					postData = {
						user_id: userID,
						gear_id: model.data.id,
						image_url: data.url
					};
					model.post('/gear/image', postData, function(error, images) {
						if(error) {
							//TODO: In this case the image should be deleted from the server
							if(callback && typeof callback === 'function') {
								callback('Error uploading file: ' + error);
							}
							return;
						}
						model.data.images = images.images;
						callback(null, data.url);
					});
				});
			});
		}

		function save(userID, callback) {
			var saveData = {
				subtype: this.data.subtype,
				brand: this.data.brand,
				model: this.data.model,
				description: this.data.description,
				images: this.data.images,
				price_a: this.data.price_a,
				price_b: this.data.price_b,
				price_c: this.data.price_c,
				address: this.data.address,
				postal_code: this.data.postal_code,
				city: this.data.city,
				region: this.data.region,
				country: this.data.country,
				latitude: this.data.latitude,
				longitude: this.data.longitude
			};

			this.put('/users/' + userID + '/gear/' + this.data.id, saveData, function(error, data) {
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
		}

		function update(userID, callback) {
			var model = this;
			this.get('/gear/' + this.data.id, function(error, gear) {
				if(error) {
					console.log(error);
					callback(error);
					return;
				}
				gear.latitude = gear.latitude * 180 / Math.PI;
				gear.longitude = gear.longitude * 180 / Math.PI;
				model.data = gear;
				callback(null);
			});
		}
	}
);