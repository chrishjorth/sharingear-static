/**
 * Controller for the Sharingear payment page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'app', 'models/card', 'models/booking', 'models/localization', 'moment'],
	function(_, $, Config, ViewController, App, Card, Booking, Localization, Moment) {
		var didInitialize,
			didRender,
			renderMissingDataInputs,
			initExpiration,
			populateCountries,
			populateBirthdateInput,

			handleCancel,
			handleBack,
			handleNext,
			handleBirthdateChange,

			processPayment,
			resetPayButton;

		didInitialize = function () {
			//var startMoment, endMoment, duration, months, weeks, days, price, VAT, priceVAT, fee, feeVAT;
			var view = this,
				startMoment, endMoment, duration, months, weeks, days, fee;

			this.booking = this.passedData.booking;
			this.gear = this.passedData.gear;

			startMoment = new Moment.tz(this.booking.data.start_time, Localization.getCurrentTimeZone());
			endMoment = new Moment.tz(this.booking.data.end_time, Localization.getCurrentTimeZone());


			duration = Moment.duration(endMoment.diff(startMoment));
			months = parseInt(duration.months(), 10);
			endMoment.subtract(months, 'months');
			duration = Moment.duration(endMoment.diff(startMoment));
			weeks = parseInt(duration.weeks(), 10);
			endMoment.subtract(weeks, 'weeks');
			duration = Moment.duration(endMoment.diff(startMoment));
			days = parseInt(duration.days(), 10);

			view.templateParameters = {
				brand: this.gear.data.brand,
				subtype: this.gear.data.subtype,
				model: this.gear.data.model,
				start_date: startMoment.format('DD/MM/YYYY HH:mm'),
				end_date: endMoment.format('DD/MM/YYYY HH:mm'),
				currency: App.user.data.currency,
				//vat: VAT,
				vat: '',
				price: '',
				//price_vat: priceVAT.toFixed(2),
				price_vat: '',
				fee: '',
				//fee_vat: feeVAT.toFixed(2),
				fee_vat: '',
				//total: (price + priceVAT + fee + feeVAT).toFixed(2)
				total: ''
			};

			this.isPaying = false;

			Localization.convertPrices([this.gear.data.price_a, this.gear.data.price_b, this.gear.data.price_c], 'EUR', App.user.data.currency, function(error, convertedPrices) {
				var price;
				if(error) {
					console.log('Error converting prices: ' + error);
					return;
				}
				price = months * Math.ceil(convertedPrices[2]) + weeks * Math.ceil(convertedPrices[1]) + days * Math.ceil(convertedPrices[0]);
				//VAT = Localization.getVAT(App.user.data.country);
				//priceVAT = parseFloat(price / 100 * VAT);
				fee = parseFloat(price / 100 * App.user.data.buyer_fee);
				//feeVAT = parseFloat(fee / 100 * VAT);

				_.extend(view.templateParameters, {
					price: price,
					fee: fee.toFixed(2),
					total: (price + fee).toFixed(2)
				});
				view.render();
			});
		};

		didRender = function () {
			this.renderMissingDataInputs();
			this.initExpiration();

			this.setupEvent('click', '#payment-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#payment-back-btn', this, this.handleBack);
			this.setupEvent('click', '#payment-next-btn', this, this.handleNext);
			this.setupEvent('change', '#payment-birthdate-year, #payment-birthdate-month', this, this.handleBirthdateChange);
		};

		initExpiration = function () {
			var monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
				startYear = parseInt((new Moment.tz(Localization.getCurrentTimeZone())).year(), 10),
				html,
				i;

			html = '<option value="-">-</option>';
			for(i = 0; i < monthsArray.length; i++) {
				html += '<option value="' + monthsArray[i] + '">' + monthsArray[i] + '</option>';
			}
			$('#payment-form-visa-month', this.$element).html(html);

			html = '<option value="-">-</option>';
			for(i = startYear; i < startYear + 30; i++) {
				html += '<option value="' + i + '">' + i + '</option>';
			}
			$('#payment-form-visa-year', this.$element).html(html);
		};

		renderMissingDataInputs = function() {
			var user = App.user.data;
			if(user.birthdate && user.birthdate !== '') {
				$('#payment-birthdate', this.$element).addClass('hidden');
			}
			else {
				this.populateBirthdateInput();
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
			var countriesArray = Localization.getCountries(),
				html = $('option', $select).first()[0].outerHTML,
				i;
				
			for(i = 0; i < countriesArray.length; i++) {
				html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name + '</option>';
			}
			$select.html(html);
		};

		populateBirthdateInput = function() {
			var $inputContainer = $('.birthday-select', this.$element),
				$selectDay = $('#payment-birthdate-day', $inputContainer),
				$selectMonth = $('#payment-birthdate-month', $inputContainer),
				$selectYear = $('#payment-birthdate-year', $inputContainer),
				html = '',
				today = new Moment.tz(Localization.getCurrentTimeZone()),
				selectedYear, selectedMonth, maxYear, monthDays, i;

			selectedYear = $selectYear.val();
			maxYear = today.year() - Config.MIN_USER_AGE;
			for(i = 1914; i <= maxYear; i++) {
				html += '<option>' + i + '</option>';
			}
			$selectYear.html(html);
			if(selectedYear === null) {
				selectedYear = today.year() - Config.AVG_USER_AGE;
			}
			$selectYear.val(selectedYear);

			selectedMonth = $selectMonth.val();
			html = '';
			for(i = 1; i <= 12; i++) {
				html += '<option>' + i + '</option>';
			}
			$selectMonth.html(html);
			if(selectedMonth === null) {
				selectedMonth = 1;
			}
			$selectMonth.val(selectedMonth);

			monthDays = new Moment.tz(selectedYear + '-' + selectedMonth + '-' + 1, 'YYYY-MM-DD', Localization.getCurrentTimeZone());
			monthDays = monthDays.endOf('month').date();
			html = '';
			for(i = 1; i <= monthDays; i++) {
				html += '<option>' + i + '</option>';
			}
			$selectDay.html(html);
			
			html = '';
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handleBack = function(event) {
			var view = event.data,
				passedData;
			passedData = {
				gear: view.gear,
				booking: view.booking
			};
			App.router.openModalSiblingView('gearbooking', passedData);
		};

		handleNext = function(event) {
			var view = event.data,
				userData = App.user.data,
				needToUpdateUser = false,
				day, month, year,
				cardNumber, expirationDateMonth,expirationDateYear,expirationDate, CSC;

			if(userData.birthdate === null || userData.birthdate === '') {
				day = $('#payment-birthdate-day', view.$element).val();
				month = $('#payment-birthdate-month', view.$element).val();
				year = $('#payment-birthdate-year', view.$element).val();
				userData.birthdate = new Moment.tz(day + '/' + month + '/' + year, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
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

			cardNumber = $('#payment-form-visa-cardnumber', view.$element).val();
			if(cardNumber === '') {
				alert('Missing card number.');
				return;
			}
			expirationDateMonth = $('#payment-form-visa-month', view.$element).val();
			expirationDateYear = $('#payment-form-visa-year', view.$element).val();

			if(expirationDateMonth === 'Select month'||expirationDateMonth==='') {
				alert('Missing expiration month.');
				return;
			}

			if(expirationDateYear === 'Select year'||expirationDateYear==='') {
				alert('Missing expiration year.');
				return;
			}

			CSC = $('#payment-form-visa-csc', view.$element).val();
			if(CSC === '') {
				alert('Missing security code.');
				return;
			}

			//Avoid user clicking multiple times and starting multiple payments
			if(view.isPaying === true) {
				return;
			}

			view.isPaying = true;

			$('#payment-next-btn', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

			var expmonth = $('#payment-form-visa-month option:selected').index();

			expirationDate = '';
			if (expmonth >= 1 && expmonth <= 9) {
				expirationDate += '0';
				expirationDate += expmonth.toString();
			}
			else {
				expirationDate += expmonth.toString();
			}

			expirationDate += '/';
			expirationDate += expirationDateYear.slice(2,4);

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

		handleBirthdateChange = function(event) {
			var view = event.data;
			view.populateBirthdateInput();
		};

		processPayment = function(cardNumber, expirationDate, CSC) {
			var view = this,
				card, cardData;
			
			expirationDate = expirationDate.substring(0, 2) + expirationDate.substring(3); //Strip separation character, regardless of its type

			//Get card registration object
			card = new Card.constructor({
				rootURL: Config.API_URL
			});
			card.initialize();
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
				view.booking.createBooking(cardId, function(error) {
                	if (error) {
                    	console.log('Error creating booking: ');
                    	console.log(error);
                    	view.resetPayButton();
                    	return;
                	}

                	if(_.isFunction(window.ga) === true) {
						window.ga('send', 'event', 'user action', 'booking', 'book gear', 1);
					}

                	window.location.href = view.booking.data.verificationURL;
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
			initExpiration:initExpiration,
			populateCountries: populateCountries,
			populateBirthdateInput: populateBirthdateInput,

			handleCancel: handleCancel,
			handleBack: handleBack,
			handleNext: handleNext,
			handleBirthdateChange: handleBirthdateChange,

			processPayment: processPayment,
			resetPayButton: resetPayButton
		});
	}
);