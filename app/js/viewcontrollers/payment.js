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

			processPayment,
			resetPayButton;

		didInitialize = function () {
			newBooking = this.passedData;
			this.templateParameters = {
				price: newBooking.data.price,
				currency: 'DKK',
				priceperhour: newBooking.data.pricePerDay,
				priceperday: newBooking.data.pricePerHour,
				priceperweek: newBooking.data.pricePerWeek,
				numberofhours: newBooking.data.numberOfHours,
				numberofdays: newBooking.data.numberOfDays,
				numberofweeks: newBooking.data.numberOfWeeks,
				startdate: newBooking.data.start_time,
				enddate: newBooking.data.end_time,
				gear: newBooking.data.gearInfo
			};
			this.isPaying = false;
		};

		didRender = function () {
			var displayDatesFrom,displayDatesTo;
			this.renderMissingDataInputs();
			displayDatesFrom = this.templateParameters.startdate;
			displayDatesTo = this.templateParameters.enddate;

			$('#payment-price-of-hour', this.$element).html(this.templateParameters.priceperhour + ' DKK');
			$('#payment-price-of-day', this.$element).html(this.templateParameters.priceperday + ' DKK');
			$('#payment-price-of-week', this.$element).html(this.templateParameters.priceperweek + ' DKK');

			$('#payment-number-of-hours', this.$element).html(this.templateParameters.numberofhours);
			$('#payment-number-of-days', this.$element).html(this.templateParameters.numberofdays);
			$('#payment-number-of-weeks', this.$element).html(this.templateParameters.numberofweeks);

			$('#payment-gear-info', this.$element).html('<h3 style="margin-bottom: -30px;">' + this.templateParameters.gear + '</h3></br>');
			$('#payment-gear-datesfrom', this.$element).html(displayDatesFrom);
			$('#payment-gear-datesto', this.$element).html(displayDatesTo);

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
				needToUpdateUser = false,
				cardNumber, expirationDate, CSC;

			if(userData.birthdate === null || userData.birthdate === '') {
				userData.birthdate = new Moment($('#payment-birthdate', view.$element).val(), 'DD/MM/YYYY');
				if(userData.birthdate.isValid() === false) {
					userData.birthdate = null;
					alert('Date of birth is invalid.');
					return;
				}
				userData.birthdate = userData.birthdate.format('YYYY-MM-DD');
				needToUpdateUser = true;
			}
			if(userData.address === null || userData === '') {
				userData.address = $('#payment-address', this.$element).val();
				if(userData.address === '') {
					alert('Address is missing.');
					return;
				}
				needToUpdateUser = true;
			}
			if(userData.postal_code === null || userData.postal_code === '') {
				userData.postal_code = $('#payment-postalcode', this.$element).val();
				if(userData.postal_code === '') {
					alert('Postal code is missing.');
					return;
				}
				needToUpdateUser = true;
			}
			if(userData.city === null || userData.city === '') {
				userData.city = $('#payment-city', this.$element).val();
				if(userData.city === '') {
					alert('City is missing.');
					return;
				}
				needToUpdateUser = true;
			}
			if(userData.country === null || userData.country === '') {
				userData.country = $('#payment-country', this.$element).val();
				if(userData.country === '') {
					alert('Country is missing.');
					return;
				}
				needToUpdateUser = true;
			}
			if(userData.nationality === null || userData.nationality === '') {
				userData.nationality = $('#payment-nationality', this.$element).val();
				if(userData.nationality === '') {
					alert('Nationality is missing.');
					return;
				}
				needToUpdateUser = true;
			}
			if(userData.phone === null || userData === '') {
				userData.phone = $('#payment-phone', this.$element).val();
				if(userData.phone === '') {
					alert('Phone is missing.');
					return;
				}
				needToUpdateUser = true;
			}
			if(App.user.data.hasWallet === false) {
				needToUpdateUser = true;
			}

			cardNumber = $('#payment-cardnumber', view.$element).val();
			if(cardNumber === '') {
				alert('Missing card number.');
				return;
			}
			expirationDate = $('#payment-expirationdate', view.$element).val();
			if(expirationDate === '') {
				alert('Missing expiration date.');
				return;
			}
			CSC = $('#payment-csc', view.$element).val();
			if(CSC === '') {
				alert('Missing security code.');
				return;
			}

			//Avoid user clicking multiple times and starting multiple payments
			if(view.isPaying === true) {
				console.log('already paying');
				return;
			}

			view.isPaying = true;

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
					view.processPayment(cardNumber, expirationDate, CSC);
				});
			}
			else {
				view.processPayment(cardNumber, expirationDate, CSC);
			}
		};

		processPayment = function(cardNumber, expirationDate, CSC) {
			var view = this,
				card, cardData;
			
			expirationDate = expirationDate.substring(0, 2) + expirationDate.substring(3); //Strip separation character, regardless of its type

			//Get card registration object
			card = new Card.constructor({
				rootURL: App.API_URL
			});
			cardData = {
				cardType: 'CB_VISA_MASTERCARD',
				cardNumber: cardNumber,
				cardExpirationDate: expirationDate,
				cardCvx: CSC
			};
			card.registerCard(App.user.data.id, cardData, function(error, cardId) {
				if(error) {
					console.log(error);
					alert('Error processing card information.');
					view.resetPayButton();
					return;
				}
				//Pre-authorize the card for the withdrawal
				newBooking.createBooking(cardId, function(error) {
                	if (error) {
                    	console.log('booking gave error');
                    	console.log(error);
                    	view.resetPayButton();
                    	return;
                	}
                	window.location.href = newBooking.data.verificationURL;
            	});
			});
		};

		resetPayButton = function() {
			this.isPaying = false;
			$('#payment-btn', this.$element).html(this.templateParameters.price + ' ' + this.templateParameters.currency);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			renderMissingDataInputs: renderMissingDataInputs,

			handleCancel: handleCancel,
			handlePay: handlePay,

			processPayment: processPayment,
			resetPayButton: resetPayButton
		});
	}
);