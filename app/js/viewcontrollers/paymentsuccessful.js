/**
 * Controller for the Sharingear payment success page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/booking', 'moment'],
	function($, ViewController, App, Booking, Moment) {
		var booking,

			didInitialize,
			didRender,

			handleClose;

		didInitialize = function () {
			var view = this;

			view.paymentSuccessful = null; //null: waiting for server

			view.templateParameters = {
				start_time: '',
				end_time: '',
				price: '',
				currency: "DKK"
			};

			booking = new Booking.constructor({
				rootURL: App.API_URL
			});
			booking.data.id = this.passedData.bookingID;
			booking.data.preauth_id = this.passedData.preAuthorizationID;
			booking.data.booking_status = 'pending';
			booking.data.gear_id = this.passedData.gear_id;
			booking.update(App.user.data.id, function(error) {
				if(error) {
					console.log('Error updating booking: ' + error);
					view.paymentSuccessful = false;
					view.render();
					return;
				};

				booking.getBookingInfo(App.user.data.id, function(error){
					if(error) {
						console.log('Error getting booking info: ' + error);
						return;
					};

					var timeFormat = 'MMMM Do YYYY, H:mm';
					var formattedEnd = Moment(booking.data.end_time).format(timeFormat);
					var formattedStart = Moment(booking.data.start_time).format(timeFormat);

					view.templateParameters.start_time = formattedStart;
					view.templateParameters.end_time = formattedEnd;
					view.templateParameters.price = booking.data.price;
					view.paymentSuccessful = true;
					view.render();
				});
			});
		};

		didRender = function () {
			if(this.paymentSuccessful === true) {
				$('.payment-success', this.$element).removeClass('hidden');
			}
			if(this.paymentSuccessful === false) {
				$('.payment-failure', this.$element).removeClass('hidden');
			}
			this.setupEvent('click', '#paymentsuccess-close-btn', this, this.handleClose);
		};

		handleClose = function() {
			App.router.setQueryString('');
			App.router.closeModalView();
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			handleClose: handleClose
		});
	}
);
