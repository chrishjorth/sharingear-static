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
			handleCancel;

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
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		return ViewController.inherit({
			newBooking: null,

			didInitialize: didInitialize,
			didRender: didRender,
			handleCancel: handleCancel
		});
	}
);