/**
 * Controller for the Sharingear payment page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/card', 'moment'],
	function($, ViewController, App, Card, Moment) {
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
			this.isPaying = false;
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
			var view = event.data,
				userData = App.user.data,
				needToUpdateUser = false;

			//Avoid user clicking multiple times and starting multiple payments
			if(this.isPaying === true) {
				return;
			}

			this.isPaying = true;

			if(userData.birthdate === null || userData.birthdate === '') {
				userData.birthdate = (new Moment($('#payment-birthdate', view.$element).val(), 'DD/MM/YYYY')).format('YYYY-MM-DD');
				needToUpdateUser = true;
			}
			if(userData.address === null || userData === '') {
				userData.address = $('#payment-address', this.$element).val();
				needToUpdateUser = true;
			}
			if(userData.postal_code === null || userData.postal_code === '') {
				userData.postal_code = $('#payment-postalcode', this.$element).val();
				needToUpdateUser = true;
			}
			if(userData.city === null || userData.city === '') {
				userData.city = $('#payment-city', this.$element).val();
				needToUpdateUser = true;
			}
			if(userData.region === null || userData.region === '') {
				userData.region = $('#payment-region', this.$element).val();
				needToUpdateUser = true;
			}
			if(userData.country === null || userData.country === '') {
				userData.country = $('#payment-country', this.$element).val();
				needToUpdateUser = true;
			}
			if(userData.nationality === null || userData.nationality === '') {
				userData.nationality = $('#payment-nationality', this.$element).val();
				needToUpdateUser = true;
			}
			if(userData.phone === null || userData === '') {
				userData.phone = $('#payment-phone', this.$element).val();
				needToUpdateUser = true;
			}
			if(App.user.data.hasWallet === false) {
				needToUpdateUser = true;
			}

			$('#payment-btn', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

			if(needToUpdateUser === true) {
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
					alert('Error processing card information.');
					return;
				}
				//Pre-authorize the card for the withdrawal
				newBooking.createBooking(cardId, function(error) {
                	if (error) {
                    	console.log('booking gave error');
                    	console.log(error);
                    	return;
                	}
                	window.location.href = newBooking.data.verificationURL;
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