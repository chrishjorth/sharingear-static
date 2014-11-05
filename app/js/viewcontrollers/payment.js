/**
 * Controller for the Sharingear payment page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['viewcontroller'],
	function(ViewController) {
		var didInitialize,
			didRender;

		didInitialize = function () {
			this.newBooking = this.passedData;
			console.log(this.newBooking);
			this.templateParameters = {
				price: this.newBooking.data.price,
				currency: '€'
			};
		};

		didRender = function () {
			
		};

		return ViewController.inherit({
			newBooking: null,

			didInitialize: didInitialize,
			didRender: didRender
		});
	}
);