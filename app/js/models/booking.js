/**
 * Defines a booking item.
 * @author: Horatiu Roman
 */
define(
	['utilities', 'model'],
	function(Utilities, Model) {
		var Booking = Model.inherit({
			data: {
				user_id: null,
				gear_id: null,
				start_time: "",
				end_time: ""
			},

			createBooking: createBooking

		});

		return Booking;

		function createBooking(callback) {
			var model = this,
				newBooking = this.data,
				postData;

			postData = {
				gear_id: newBooking.gear_id,
				start_time: newBooking.start_time,
				end_time: newBooking.end_time
			};

			this.post('/users/' + newBooking.user_id + '/bookings', postData, function(error, data) {
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
	}
);