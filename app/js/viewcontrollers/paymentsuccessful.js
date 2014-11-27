/**
 * Controller for the Sharingear payment success page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/booking'],
	function($, ViewController, App, Booking) {
		var booking,

			didInitialize,
			didRender,

			handleClose;

		didInitialize = function () {
			var view = this;
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
					return;
				}
				view.render();
			});
		};

		didRender = function () {
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