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
			renderMissingDataInputs,

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
			if(App.user.hasWallet === false) {
				this.renderMissingDataInputs();
			}
			this.setupEvent('click', '#payment-cancel-btn', this, this.handleCancel);
			this.setupEvent('submit', '#payment-form', this, this.handlePay);
		};

		renderMissingDataInputs = function() {
			var user = App.user.data;
			if(user.birthdate && user.birthdate !== '') {
				$('#payment-birthdate', this.$element).parent().addClass('hidden');
			}
			if(user.address && user.address !== '') {
				$('#payment-address', this.$element).parent().addClass('hidden');
			}
			if(user.postal_code && user.postal_code !== '') {
				$('#payment-postalcode', this.$element).parent().addClass('hidden');
			}
			if(user.city && user.city !== '') {
				$('#payment-city', this.$element).parent().addClass('hidden');
			}
			if(user.region && user.region !== '') {
				$('#payment-region', this.$element).parent().addClass('hidden');
			}
			if(user.country && user.country !== '') {
				$('#payment-country', this.$element).parent().addClass('hidden');
			}
			else {
				populateCountries($('#payment-country', this.$element));
			}
			if(user.nationality && user.nationality !== '') {
				$('#payment-nationality', this.$element).parent().addClass('hidden');
			}
			else {
				populateCountries($('#payment-nationality', this.$element));
			}
			if(user.phone && user.phone !== '') {
				$('#payment-phone', this.$element).parent().addClass('hidden');
			}
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
			renderMissingDataInputs: renderMissingDataInputs,

			handleCancel: handleCancel,
			handlePay: handlePay
		});
	}
);