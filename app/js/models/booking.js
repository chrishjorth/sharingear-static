/**
 * Defines a booking item.
 * @author: Horatiu Roman, Gediminas Bivainis
 */
define(
	['utilities', 'model'],
	function(Utilities, Model) {
		var Booking = Model.inherit({
			createBooking: createBooking,
            getBookingInfo: getBookingInfo,
            updateBooking : updateBooking
		});

		return Booking;

        // POST: /users/:user_id/gear/:gear_id/bookings
		function createBooking(callback) {
			var model = this,
				newBooking = this.data,
                url,
				postData;

            url = '/users/' + newBooking.user_id +
                  '/gear/' + newBooking.gear_id +
                  '/bookings';

			postData = {
				gear_id: newBooking.gear_id,
				start_time: newBooking.start_time,
				end_time: newBooking.end_time
			};

			this.post(url, postData, function(error, data) {
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

        // GET: /users/:user_id/gear/:gear_id/bookings/:booking_id (also accepts 'latest')
        /**
         * @param userID: The id of the logged in user, required for authorization
         */
        function getBookingInfo(userID, bookingId, callback) {
            var model = this,
                url = '/users/' + userID + '/gear/' + this.data.gear_id + '/bookings/' + bookingId;

            this.get(url, function(error, booking) {
                if(error) {
                    callback(error);
                    return;
                }
                _.extend(model.data, booking);
                callback(null);
            });
        }

        // PUT: /users/:user_id/gear/:gear_id/bookings/:booking_id
        function updateBooking(bookingId, callback) {

            var model = this,
                url = '/users/' + this.data.user_id + '/gear/' + this.data.gear_id + '/bookings/' + bookingId,
                putData = {
                    booking_status: this.data.booking_status
                };

            this.put(url, putData, function(error, booking) {
                if(error) {
                    console.log(error);
                    callback(error);
                    return;
                }

                _.extend(model.data, booking);
                if(callback && typeof callback === 'function') {
                    callback(null);
                }
            });
        }
	}
);
