/**
 * Defines a booking item.
 * @author: Horatiu Roman, Gediminas Bivainis, Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'model', 'app'],
	function(_, Utilities, Model, App) {
		var didInitialize,
            createBooking,
            getBookingInfo,
            update;

        didInitialize = function() {
            if(this.data === null) {
                this.data = {
                    gear_id: null,
                    start_time: null,
                    end_time: null,
                    cardId: null,
                    returnURL: null
                };
            }
        };

        // POST: /users/:user_id/gear/:gear_id/bookings
		createBooking = function(cardId, callback) {
			var model = this,
				newBooking = this.data,
                url,
				postData;

            url = '/users/' + App.user.data.id +'/gear/' + newBooking.gear_id + '/bookings';

			postData = {
				gear_id: newBooking.gear_id,
				start_time: newBooking.start_time,
				end_time: newBooking.end_time,
                cardId: cardId,
                returnURL: window.location.href
			};

			this.post(url, postData, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback(error);
					}
					return;
				}
				_.extend(model.data, data);
				callback(null);
			});
		};

        getBookingInfo = function(userID, callback) {
            var model = this,
                url = '/users/' + userID + '/gear/' + this.data.gear_id + '/bookings/' + this.data.id;

            this.get(url, function(error, booking) {
                if(error) {
                    callback(error);
                    return;
                }
                _.extend(model.data, booking);
                callback(null);
            });
        };

        // PUT: /users/:user_id/gear/:gear_id/bookings/:booking_id
        update = function(userID, callback) {
            var model = this,
                url = '/users/' + userID + '/gear/' + this.data.gear_id + '/bookings/' + this.data.id;

            this.put(url, model.data, function(error, booking) {
                if(error) {
                    console.log(error);
                    callback(error);
                    return;
                }

                _.extend(model.data, booking);
                callback(null);
            });
        };

        return Model.inherit({
            didInitialize: didInitialize,
            createBooking: createBooking,
            getBookingInfo: getBookingInfo,
            update: update
        });
	}
);
