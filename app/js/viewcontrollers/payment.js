/**
 * Controller for the Sharingear payment page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/card'],
	function($, ViewController, App, Card) {
		var newBooking,

			didInitialize,
			didRender,
			renderMissingDataInputs,
			populateCountries,

			handleCancel,
			handlePay,

			processPayment;

		didInitialize = function () {
			newBooking = this.passedData;
			this.templateParameters = {
				price: newBooking.data.price,
				currency: 'DKK'
			};
		};

		didRender = function () {
			//the pay event must also create booking!!!
			if(App.user.data.hasWallet === false) {
				this.renderMissingDataInputs();
			}
			else {
				$('.missing-userdata', this.$element).addClass('hidden');
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

		populateCountries = function($select) {
			var countriesArray = App.localization.getCountries(),
				html = $('option', $select).first()[0].outerHTML,
				i;
			for(i = 0; i < countriesArray.length; i++) {
				html += '<option value="' + countriesArray[i].alpha2 + '">' + countriesArray[i].name + '</option>';
			}
			$select.html(html);
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handlePay = function(event) {
			var view = event.data;

			if(App.user.data.hasWallet === false) {
				App.user.update(function(error) {
					if(error) {
						console.log('Error updating user: ' + error);
						return;
					}
					if(App.user.data.hasWallet === false) {
						console.log('Error creating wallet for user.');
						return;
					}
					view.processPayment();
				});
			}
			else {
				view.processPayment();
			}
		};

		processPayment = function() {
			var view = this,
				card, expirationDate, cardData;

			expirationDate = $('#payment-expirationdate', view.$element).val();
			expirationDate = expirationDate.substring(0, 2) + expirationDate.substring(3); //Strip separation character, regardless of its type

			//Get card registration object
			card = new Card.constructor({
				rootURL: App.API_URL
			});
			cardData = {
				//cardType: $('#payment-form input[name="cardtype"]', view.$element).val(),
				cardType: 'CB_VISA_MASTERCARD',
				cardNumber: $('#payment-cardnumber', view.$element).val(),
				cardExpirationDate: expirationDate,
				cardCvx: $('#payment-csc', view.$element).val()
			};
			card.registerCard(App.user.data.id, cardData, function(error, cardId) {
				if(error) {
					console.log(error);
					return;
				}
				//Pre-authorize the card for the withdrawal
				newBooking.createBooking(cardId, function(error) {
                	if (error) {
                    	console.log('booking gave error');
                    	console.log(error);
                    	return;
                	}
                	App.router.closeModalView();
            	});
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			renderMissingDataInputs: renderMissingDataInputs,

			handleCancel: handleCancel,
			handlePay: handlePay,

			processPayment: processPayment
		});
	}
);