/**
 * Controller for the Sharingear Submerchant registration form view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'config', 'app', 'models/localization', 'moment', 'googlemaps'],
	function(_, $, ViewController, Config, App, Localization, Moment, GoogleMaps) {
		var geocoder = new GoogleMaps.Geocoder(),

			didInitialize,
			didRender,

			setupForm,
			populateBirthdateInput,
			populateCountries,
			showTerms,

			handleBirthdateChange,
			handleCountrySelect,

			submitForm,
			acceptTerms;

		didInitialize = function() {
			this.formSubmitted = false;
		};

		didRender = function() {
			if(this.formSubmitted === true) {
				this.showTerms();
			}
			else {
				this.setupForm();
			}
			this.setupEvent('change', '#submerchantregistration-birthdate-year, #submerchantregistration-birthdate-month', this, this.handleBirthdateChange);
			this.setupEvent('change', '#submerchantregistration-country', this, this.handleCountrySelect);
		};

		setupForm = function() {
			var user = App.user.data;

			if(user.birthdate && user.birthdate !== '') {
				$('#submerchantregistration-birthdate', this.$element).parent().addClass('hidden');
			}
			else {
				this.populateBirthdateInput();
			}
			if(user.address && user.address !== '') {
				$('#submerchantregistration-address', this.$element).parent().addClass('hidden');
			}
			if(user.postal_code && user.postal_code !== '') {
				$('#submerchantregistration-postalcode', this.$element).parent().addClass('hidden');
			}
			if(user.city && user.city !== '') {
				$('#submerchantregistration-city', this.$element).parent().addClass('hidden');
			}
			if(user.region && user.region !== '') {
				$('#submerchantregistration-region', this.$element).parent().addClass('hidden');
			}
			if(user.country && user.country !== '') {
				$('#submerchantregistration-country', this.$element).parent().addClass('hidden');
				if(user.country === 'US') {
					$('#aba-container', this.$element).removeClass('hidden');
				}
				else {
					$('#iban-container', this.$element).removeClass('hidden');
				}
			}
			else {
				this.populateCountries($('#submerchantregistration-country', this.$element));
			}
			if(user.nationality && user.nationality !== '') {
				$('#submerchantregistration-nationality', this.$element).parent().addClass('hidden');
			}
			else {
				this.populateCountries($('#submerchantregistration-nationality', this.$element));
			}
			if(user.phone && user.phone !== '') {
				$('#submerchantregistration-phone', this.$element).parent().addClass('hidden');
			}
		};

		populateBirthdateInput = function() {
			var $inputContainer = $('.birthday-select', this.$element),
                $selectDay = $('#submerchantregistration-birthdate-date', $inputContainer),
                $selectMonth = $('#submerchantregistration-birthdate-month', $inputContainer),
                $selectYear = $('#submerchantregistration-birthdate-year', $inputContainer),
                html = '<option> - </option>',
                today = new Moment.tz(Localization.getCurrentTimeZone()),
                selectedYear = null,
                selectedMonth = null,
                selectedDay = null,
                maxYear, monthDays, i;

            selectedYear = $selectYear.val();
            maxYear = today.year() - Config.MIN_USER_AGE;
            for(i = 1914; i <= maxYear; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectYear.html(html);
            if(selectedYear !== null && selectedYear !== '-') {
                $selectYear.val(selectedYear);
            } else {   							// 
            	selectedYear = new Moment.tz(Localization.getCurrentTimeZone()).format('YYYY');
            }

            selectedMonth = $selectMonth.val();
            html = '<option> - </option>';
            for(i = 1; i <= 12; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectMonth.html(html);
            if(selectedMonth !== null) {
                $selectMonth.val(selectedMonth);
            }
            
            selectedDay = $selectDay.val();
            monthDays = new Moment.tz(selectedYear + '-' + selectedMonth + '-' + 1, 'YYYY-MM-DD', Localization.getCurrentTimeZone());
            monthDays = monthDays.endOf('month').date();
            html = '<option> - </option>';
            for(i = 1; i <= monthDays; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectDay.html(html);
            if(selectedDay !== null) {
            	if(selectedDay <= monthDays) {
            		$selectDay.val(selectedDay);
                } else {
                	$selectDay.val('-');
                }
            } else {
            	$selectDay.val('-');
            }
            
            html = '';
		};

		populateCountries = function($select) {
            var html = $('option', $select).first()[0].outerHTML,
            	countriesArray, i;
			countriesArray = Localization.getCountries();
			for(i = 0; i < countriesArray.length; i++) {
				html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m){ return m.toUpperCase(); }) + '</option>';
			}

			$select.html(html);
		};

		showTerms = function() {
			$('#addgear-availability-submerchantform', this.$element).addClass('hidden');
			$('#submerchantregistration-terms-container', this.$element).removeClass('hidden');
			this.formSubmitted = true;
		};

		handleBirthdateChange = function(event) {
			var view = event.data;
			view.populateBirthdateInput();
		};

		handleCountrySelect = function() {
			var country = $(this).val();
			if(country === 'US') {
				$('#iban-container', this.$element).addClass('hidden');
				$('#aba-container', this.$element).removeClass('hidden');
			}
			else {
				$('#aba-container', this.$element).addClass('hidden');
				$('#iban-container', this.$element).removeClass('hidden');
			}
		};

		submitForm = function(callback) {
			var view = this,
				user = App.user.data,
				tempUser = {},
				day, month, year, addressOneliner, $select, content, iban, swift, ibanRegEx, swiftRegEx, accountNumber, accountNumberRegEx, aba, abaRegEx;

			_.extend(tempUser, user);

			if(user.birthdate === null) {
				day = $('#submerchantregistration-birthdate-date', view.$element).val();
				month = $('#submerchantregistration-birthdate-month', view.$element).val();
				year = $('#submerchantregistration-birthdate-year', view.$element).val();
				tempUser.birthdate = (new Moment.tz(day + '/' + month + '/' + year, 'DD/MM/YYYY', Localization.getCurrentTimeZone())).format('YYYY-MM-DD');
			}
			if(user.address === null) {
				tempUser.address = $('#submerchantregistration-address', view.$element).val();
			}
			if(user.postal_code === null) {
				tempUser.postal_code = $('#submerchantregistration-postalcode', view.$element).val();
			}
			if(user.city === null) {
				tempUser.city = $('#submerchantregistration-city', view.$element).val();
			}
			if(user.region === null) {
				tempUser.region = $('#submerchantregistration-region', view.$element).val();
			}
			if(user.country === null) {
				$select = $('#submerchantregistration-country', view.$element);
				content = $select.val();
				if(content !== $('option', $select).first().attr('value')) {
					tempUser.country = content;
				}
				else {
                	alert('Please select a country.');
                	callback('Country is missing.');
                	return;
            	}
			}
			if(user.nationality === null) {
				$select = $('#submerchantregistration-nationality', view.$element);
				content = $select.val();
				if(content !== $('option', $select).first().attr('value')) {
					tempUser.nationality = content;
				}
				else {
                	alert('Please select a nationality.');
                	callback('Nationality is missing');
                	return;
            	}
			}
			if(user.phone === null) {
				tempUser.phone = $('#submerchantregistration-phone', view.$element).val();
			}

			//Validate
			if(tempUser.birthdate === '' || tempUser.birthdate === 'Invalid date') {
                alert('The date of birth field is required.');
                callback('Date of birth is missing.');
                return;
            }
            if(tempUser.address === '') {
            	alert('The address field is required.');
            	callback('Address is missing.');
            	return;
			}
			if(tempUser.postal_code === '') {
				alert('The postal code field is required.');
				callback('Postal code is missing.');
				return;
			}
			if(tempUser.city === '') {
				alert('The city field is required.');
				callback('City is missing.');
				return;
			}
            if(tempUser.phone === '') {
                alert('The phone field is required.');
                callback('Phone is missing.');
                return;
            }

            if(tempUser.country === 'US') {
            	accountNumber = $('#submerchantregistration-accountnumber', view.$element).val();
            	accountNumberRegEx = /\d+/;
            	accountNumber = accountNumber.match(accountNumberRegEx);
            	if(accountNumber === null) {
            		alert('Please insert your bank account number.');
            		callback('Bank account number missing.');
            		return;
            	}
            	user.accountNumber = accountNumber[0];

            	aba = $('#submerchantregistration-aba', view.$element).val();
            	abaRegEx = /\d{9}/;
            	aba = aba.match(abaRegEx);
            	if(aba === null) {
            		alert('Please insert your routing number.');
            		callback('Routing number missing.');
            		return;
            	}
            	user.aba = aba[0];
            }
            else {
            	iban = $('#submerchantregistration-iban', view.$element).val();
				ibanRegEx = /^[a-zA-Z]{2}\d{2}\s*(\w{4}\s*){2,7}\w{1,4}\s*$/;
				iban = iban.match(ibanRegEx);
				if(iban === null) {
					alert('Please insert a correct IBAN.');
					callback('IBAN is missing.');
					return;
				}
				user.iban = iban[0];

            	swift = $('#submerchantregistration-swift', view.$element).val();
				swiftRegEx = /^[a-zA-Z]{6}\w{2}(\w{3})?$/;
				swift = swift.match(swiftRegEx);
				if(swift === null) {
					alert('Please insert a correct SWIFT');
					callback('SWIFT is missing.');
					return;
				}
				user.swift = swift[0];
            }

            addressOneliner = tempUser.address + ', ' + tempUser.postal_code + ' ' + tempUser.city + ', ' + tempUser.country;
            geocoder.geocode({'address': addressOneliner}, function(results, status) {
                if(status === GoogleMaps.GeocoderStatus.OK) {
                	_.extend(user, tempUser);
                	view.showTerms();
                	callback(null);
                }
                else {
                    alert('The address is not valid!');
                    callback('Invalid address.');
                }
            });
		};

		acceptTerms = function(callback) {
			App.user.update(function(error) {
				if(error) {
					alert('Error saving user data.');
					callback(error);
					return;
				}
				App.user.updateBankDetails(function(error) {
					if(error) {
						alert('Error registering bank data.');
						callback(error);
						return;
					}
					App.user.fetch(function(error) {
						if(error) {
							callback('Error fetching user: ' + error);
							return;
						}
						callback(null);
					});
				});
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			setupForm: setupForm,
			populateBirthdateInput: populateBirthdateInput,
			populateCountries: populateCountries,
			showTerms: showTerms,

			handleBirthdateChange: handleBirthdateChange,
			handleCountrySelect: handleCountrySelect,

			submitForm: submitForm,
			acceptTerms: acceptTerms
		});
	}
);