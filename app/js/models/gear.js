/**
 * Defines a gear item.
 * @author: Chris Hjorth
 */
define(
	['utilities', 'model'],
	function(Utilities, Model) {
		var Gear = Model.inherit({
			createGear: createGear,
			uploadImage: uploadImage
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
				owner_id: user.data.id,
				fb_token: user.data.fb_token
			};
			this.post('/gear', postData, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback();
					}
					return;
				}
				_.extend(model.data, data);
				console.log('Gear created:');
				console.log(data);
				if(callback && typeof callback === 'function') {
					callback();
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
					if(error) {
						if(callback && typeof callback === 'function') {
							callback('Error uploading file: ' + error);
						}
						return;
					}
					callback(null, data.url);
				});
			});
		}
	}
);