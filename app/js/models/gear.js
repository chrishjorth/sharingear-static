/**
 * Defines a gear item.
 * @author: Chris Hjorth
 */
define(
	['model'],
	function(Model) {
		var Gear = Model.inherit({
			createGear: createGear
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
	}
);