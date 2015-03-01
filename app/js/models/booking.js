/**
 * Defines a booking item.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'model', 'app', 'models/localization', 'moment'],
	function(_, Utilities, Model, App, Localization, Moment) {
		var didInitialize,
            createBooking,
            getBookingInfo,
            update;

        didInitialize = function() {
            if(this.data === null) {
                this.data = {
                    //The non-null id property determines the booking type
                    gear_id: null,
                    van_id: null,
                    item_name: '', //Displayed name of the booked item
                    price_a: 0,
                    price_b: 0,
                    price_c: 0,
                    currency: 0,
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

            if(this.data.van_id !== null) {
                url = '/users/' + App.user.data.id +'/vans/' + newBooking.van_id + '/bookings';
            }
            else {
                url = '/users/' + App.user.data.id +'/gear/' + newBooking.gear_id + '/bookings';
            }

            postData = {
                start_time: newBooking.start_time.tz('UTC').format('YYYY-MM-DD HH:mm:ss'),
                end_time: newBooking.end_time.tz('UTC').format('YYYY-MM-DD HH:mm:ss'),
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
                url;

            if(this.data.van_id !== null) {
                url = '/users/' + userID + '/vans/' + this.data.van_id + '/bookings/' + this.data.id;
            }
            else {
                url = '/users/' + userID + '/gear/' + this.data.gear_id + '/bookings/' + this.data.id;
            }

            this.get(url, function(error, booking) {
                if(error) {
                    callback(error);
                    return;
                }
                _.extend(model.data, booking);

                model.data.start_time = new Moment.tz(model.data.start_time, 'YYYY-MM-DD HH:mm:ss', 'UTC');
                model.data.end_time = new Moment.tz(model.data.end_time, 'YYYY-MM-DD HH:mm:ss', 'UTC');

                callback(null);
            });
        };

        // PUT: /users/:user_id/gear/:gear_id/bookings/:booking_id
        update = function(userID, callback) {
            var model = this,
                url, updateData;

            if(this.data.van_id !== null) {
                url = '/users/' + userID + '/vans/' + this.data.vans_id + '/bookings/' + this.data.id;
            }
            else {
                url = '/users/' + userID + '/gear/' + this.data.gear_id + '/bookings/' + this.data.id;
            }

            updateData = {
                booking_status: model.data.booking_status,
                preauth_id: model.data.preauth_id
            };

            this.put(url, updateData, function(error, booking) {
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
