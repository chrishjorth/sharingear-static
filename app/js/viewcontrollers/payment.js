/**
 * Controller for the Sharingear payment page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var didInitialize,
			didRender,
			handleCancel,
			handlePay;

		didInitialize = function () {
			this.newBooking = this.passedData;
			this.templateParameters = {
				price: this.newBooking.data.price,
				currency: '€'
			};
		};

		didRender = function () {
			//the pay event must also create booking!!!
			this.setupEvent('click', '#payment-cancel-btn', this, this.handleCancel);
			this.setupEvent('submit', '#payment-form', this, this.handlePay);
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handlePay = function(event) {
			var view = event.data;
			view.newBooking.createBooking(function(error) {
                if (error) {
                    console.log('booking gave error');
                    console.log(error);
                }
                App.router.closeModalView();
            });
		};

		return ViewController.inherit({
			newBooking: null,

			didInitialize: didInitialize,
			didRender: didRender,
			handleCancel: handleCancel,
			handlePay: handlePay
		});
	}
);