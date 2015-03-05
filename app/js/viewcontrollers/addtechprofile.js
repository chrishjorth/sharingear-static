/**
 * Controller for the Sharingear Add tech profile view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'app', 'models/techprofile', 'models/localization', 'googlemaps', 'moment'],
	function(_, $, Config, ViewController, App, TechProfile, Localization, GoogleMaps, Moment) {
		var countryDefault = 'Select country:',
			geocoder,

			didInitialize,
			didRender,

			getTabID,
			toggleLoading,

			addTechProfileIcons,
			handleTechProfileRadio,
			saveTechProfile,

			populateYearsOfExperience,
			handleExperienceStartYearChange,
			saveExperience,

			populateCountries,
			populatePriceSuggestions,
			handlePriceChange,
			handleDeliveryCheckbox,
			savePriceLocation,

			renderAvailability,
			renderSubmerchantForm,
			populateBirthdateInput,
			handleBirthdateChange,
			handleSubmerchantSubmit,
			handleSubmerchantAccept,
			handleAvailabilityNext,
			saveAvailability,

			handleCancel,
			handleNext,
			handleViewTechProfile,
			handleAddMoreTechProfiles,

			showPanel;

		geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			if(App.user.data.id === null) {
				this.ready = false;
				App.router.navigateTo('home');
				return;
			}

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.isLoading = false;

			this.templateParameters = {
				currency: App.user.data.currency
			};

			this.newTechProfile = new TechProfile.constructor({
				rootURL: Config.API_URL
			});
			this.newTechProfile.initialize();

			this.hasDelivery = false;

			this.shownMoment = new Moment.tz(Localization.getCurrentTimeZone());
			this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
			this.alwaysFlag = 1; //New tech profiles are always available by default
			this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
		};

		didRender = function() {
			this.addTechProfileIcons();
			
			this.populateCountries($('#dashboard-addtechprofileprice-country', this.$element));

			$('#dashboard-addtechprofileprice-form #price_a', this.$element).val(this.newTechProfile.data.price_a);
			$('#dashboard-addtechprofileprice-form #price_b', this.$element).val(this.newTechProfile.data.price_b);
			$('#dashboard-addtechprofileprice-form #price_c', this.$element).val(this.newTechProfile.data.price_c);

			this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '.next-btn', this, this.handleNext);
			this.setupEvent('change', '#addtechprofile-form-type .addtechprofilebuttonlist-container input[type="radio"]', this, this.handleTechProfileRadio);

			this.setupEvent('click', '#addtechprofile-startyear', this, this.handleExperienceStartYearChange);

			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#submerchantregistration-birthdate-year, #submerchantregistration-birthdate-month', this, this.handleBirthdateChange);
		};

		getTabID = function() {
			var tabID = null;
			$('.addtechprofile-panel').each(function() {
				var $this = $(this);
				if($this.hasClass('hidden') === false) {
					tabID = $this.attr('id');
				}
			});
			return tabID;
		};

		populatePriceSuggestions = function () {
			var techProfileClassification = App.contentClassification.data.roadieClassification,
				view = this,
                i, suggestionA, suggestionB, suggestionC;

            for(i = 0; i < techProfileClassification.length; i++) {
                if(techProfileClassification[i].roadie_type === view.newTechProfile.data.roadie_type) {
                    suggestionA = techProfileClassification[i].price_a_suggestion;
                    suggestionB = techProfileClassification[i].price_b_suggestion;
                    suggestionC = techProfileClassification[i].price_c_suggestion;
                    i = techProfileClassification.length;
                }
            }
            Localization.convertPrices([suggestionA, suggestionB, suggestionC], 'EUR', App.user.data.currency, function(error, convertedPrices) {
            	if(error) {
            		console.log('Could not convert price suggestions: ' + error);
            		return;
            	}
            	$('#addtechprofile-price_a-suggestion', view.$element).html(Math.ceil(convertedPrices[0]));
            	$('#addtechprofile-price_b-suggestion', view.$element).html(Math.ceil(convertedPrices[1]));
            	$('#addtechprofile-price_c-suggestion', view.$element).html(Math.ceil(convertedPrices[2]));
            });
		};

		toggleLoading = function() {
			if(this.isLoading === true) {
				$('.next-btn', this.$element).html('Next <i class="fa fa-arrow-circle-right"></i>');
				this.isLoading = false;
			}
			else {
				$('.next-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
				this.isLoading = true;
			}
		};

		addTechProfileIcons = function() {
			var view = this,
				techProfileClassification = App.contentClassification.data.roadieClassification,
				html = '',
				techProfileType, i;

			for(i = 0; i < techProfileClassification.length; i++) {
				techProfileType = techProfileClassification[i].roadie_type.replace(/\s/g, ''); //Remove spaces
				html += '<div class="custom-radio custom-radio-small">';
				html += '<input type="radio" name="techprofile-radio" id="addtechprofile-radio-' + techProfileClassification[i].roadie_type + '" value="' + techProfileClassification[i].roadie_type + '">';
				html += '<label for="addtechprofile-radio-' + techProfileClassification[i].roadie_type + '">';
				html += '<div class="custom-radio-icon sg-icon icon-addtechprofile-' + techProfileType.toLowerCase() + '"></div>';
				html += '<span>' + techProfileClassification[i].roadie_type + '</span>';
				html += '</label>';
				html += '</div>';
			}

			$('.addtechprofilebuttonlist-container', view.$element).append(html);
		};

		/**
		 * @assertion: techProfileClassification has been loaded
		 */
		handleTechProfileRadio = function(event) {
			var view = event.data;
			$('.hint1', view.$element).addClass('hidden');
		};

		saveTechProfile = function() {
			var view = this,
				newData;

			if(view.isLoading === true) {
				return;
			}

			//Create new tech profile model object from form data
			newData = {
				roadie_type: $('#addtechprofile-form-type .addtechprofilebuttonlist-container input[type="radio"]:checked').val(),
				about: $('#addtechprofile-form-about').val(),
				currently: $('#addtechprofile-form-currently').val(),
				genres: $('#addtechprofile-form-genres').val(),
				currency: App.user.data.currency
			};

			//Validate
			if(!newData.roadie_type || newData.roadie_type === '') {
				alert('Please select a type of technician.');
				return;
			}

			this.toggleLoading();

			_.extend(this.newTechProfile.data, newData);
			
			this.newTechProfile.createTechProfile(function(error) {
				if(error) {
					alert('Error saving tech profile');
					return;
				}

				view.showPanel('#addtechprofile-panel-experience');
				view.populateYearsOfExperience();
				view.toggleLoading();
			});
			
		};

		populateYearsOfExperience = function() {
			var $startYear = $('#addtechprofile-startyear', this.$element),
				$endYear = $('#addtechprofile-endyear', this.$element),
				startYearSelectHTML = '',
				endYearSelectHTML = '',
				currentYear = (new Moment.tz(Localization.getCurrentTimeZone())).year(),
				startYear, endYear, i;

			startYear = $startYear.val();
			if(startYear === null) {
				startYear = Config.MIN_XP_START_YEAR;
			}
			endYear = $endYear.val();
			if(endYear === null) {
				endYear = currentYear;
			}
			if(endYear < startYear) {
				endYear = startYear;
			}
			for(i = Config.MIN_XP_START_YEAR; i < startYear; i++) {
				startYearSelectHTML += '<option value="' + i + '">' + i + '</option>';
			}
			for(i = startYear; i <= currentYear; i++) {
				startYearSelectHTML += '<option value="' + i + '">' + i + '</option>';
				endYearSelectHTML += '<option value="' + i + '">' + i + '</option>';
			}
			$startYear.html(startYearSelectHTML);
			$startYear.val(startYear);
			$endYear.html(endYearSelectHTML);
			$endYear.val(endYear);
		};

		handleExperienceStartYearChange = function(event) {
			var view = event.data;
			view.populateYearsOfExperience();
		};

		saveExperience = function() {
			_.extend(this.newTechProfile.data, {
				experience: $('#addtechprofile-experience', this.$element).val(),
				xp_years: $('#addtechprofile-startyear', this.$element).val() + '-' + $('#addtechprofile-endyear', this.$element).val(),
				tours: $('#addtechprofile-tours', this.$element).val(),
				companies: $('#addtechprofile-companies', this.$element).val(),
				bands: $('#addtechprofile-bands').val()
			});
			this.populatePriceSuggestions();
			this.showPanel('#addtechprofile-panel-pricelocation');
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

		handlePriceChange = function() {
			var $this = $(this),
				price;
			price = parseInt($this.val(), 10);
			if(isNaN(price)) {
				price = '';
			}
			$this.val(price);
		};

		savePriceLocation = function() {
			var view = this,
                isLocationSame, addressOneliner, newTechProfileData, saveCall,
                currentAddress, currentPostalCode, currentCity, currentRegion, currentCountry, didLocationChange;

            if(view.isLoading === true) {
            	return;
            }

            currentAddress = this.newTechProfile.address;
			currentPostalCode = this.newTechProfile.postal_code;
			currentCity = this.newTechProfile.city;
			currentRegion = this.newTechProfile.region;
			currentCountry = this.newTechProfile.country;
			didLocationChange = false;

			_.extend(this.newTechProfile.data, {
				price_a: $('#price_a', this.$element).val(),
				price_b: $('#price_b', this.$element).val(),
				price_c: $('#price_c', this.$element).val(),
				currency: App.user.data.currency,
                address: $('#dashboard-addtechprofileprice-address', this.$element).val(),
				postal_code: $('#dashboard-addtechprofileprice-postalcode', this.$element).val(),
				city: $('#dashboard-addtechprofileprice-city', this.$element).val(),
				country: $('#dashboard-addtechprofileprice-country option:selected').val()
			});

			if(this.hasDelivery === true) {
				this.newTechProfile.data.delivery_price = $('#dashboard-addtechprofileprice-form input[name="delivery_price"]', this.$element).val();
				this.newTechProfile.data.delivery_distance = $('#dashboard-addtechprofileprice-form input[name="delivery_distance"]', this.$element).val();
			}

			newTechProfileData = this.newTechProfile.data;

			//Validation
			if(newTechProfileData.price_a === '') {
				alert('Price is missing.');
				return;
			}
			if(newTechProfileData.price_a % 1 !==0) {
				alert('Hourly price is invalid.');
				return;
			}
			if(newTechProfileData.price_b === '') {
				alert('Price is missing.');
				return;
			}
			if(newTechProfileData.price_b % 1 !==0) {
				alert('Daily is invalid.');
				return;
			}
			if(newTechProfileData.price_c === '') {
				alert('Price is missing.');
				return;
			}
			if(newTechProfileData.price_c % 1 !==0) {
				alert('Weekly is invalid.');
				return;
			}
			if(this.hasDelivery === true && newTechProfileData.delivery_price === '') {
				alert('Delivery price is missing.');
				return;
			}
			if(this.hasDelivery === true && newTechProfileData.delivery_distance === '') {
				alert('Delivery distance is missing.');
				return;
			}
			if(newTechProfileData.address === '') {
				alert('Address is missing');
				return;
			}
			if(newTechProfileData.postal_code === '') {
				alert('Postal code is missing.');
				return;
			}
			if(newTechProfileData.city === '') {
				alert('City is missing.');
				return;
			}
			if(newTechProfileData.country === '' || newTechProfileData.country === countryDefault) {
				alert('Country is missing.');
				return;
			}

			isLocationSame = (currentAddress === newTechProfileData.address &&
				currentPostalCode === newTechProfileData.postal_code &&
				currentCity === newTechProfileData.city &&
				currentRegion === newTechProfileData.region &&
				currentCountry === newTechProfileData.country);

			view.toggleLoading();

			saveCall = function() {
				view.newTechProfile.save(function(error) {
					if(error) {
						alert('Error saving data');
						view.toggleLoading();
						return;
					}
						
					if(App.user.isSubMerchant() === false) {
						view.showPanel('#addtechprofile-panel-submerchantForm');
						view.renderSubmerchantForm();
					}
					else {
						view.showPanel('#addtechprofile-panel-availability');
						view.renderAvailability();
					}
					view.toggleLoading();
				});
			};

			if(isLocationSame === false) {
				addressOneliner = newTechProfileData.address + ', ' + newTechProfileData.postal_code + ' ' + newTechProfileData.city + ', ' + newTechProfileData.country;
				geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.newTechProfile.data.longitude = results[0].geometry.location.lng();
						view.newTechProfile.data.latitude = results[0].geometry.location.lat();
						saveCall();
					}
					else {
						console.log('Error geocoding: ' + status);
                        alert('Address error');
                        view.toggleLoading();
					}
				});
			}
			else {
				saveCall();
			}
		};

		renderAvailability = function() {
			var view = this,
				$calendarContainer;
			$calendarContainer = $('#addtechprofile-availability-calendar', this.$element);
			$calendarContainer.removeClass('hidden');
			require(['viewcontrollers/availabilitycalendar', 'text!../templates/availabilitycalendar.html'], function(calendarVC, calendarVT) {
				view.calendarVC = new calendarVC.constructor({name: 'availabilitycalendar', $element: $calendarContainer, template: calendarVT, passedData: view.newTechProfile});
				view.calendarVC.initialize();
				view.newTechProfile.getAvailability(function(error, result) {
                	var selections = {},
                    	availabilityArray, i, startMoment, endMoment;

                	if(error) {
                		console.log('Error retrieving techprofile availability: ' + error);
                    	return;
                	}

                	availabilityArray = result.availabilityArray;
                	for(i = 0; i < availabilityArray.length; i++) {
                    	startMoment = new Moment.tz(availabilityArray[i].start, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
                    	endMoment = new Moment.tz(availabilityArray[i].end, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
                    	if(Array.isArray(selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
                        	selections[startMoment.year() + '-' + (startMoment.month() + 1)] = [];
                    	}
                    	selections[startMoment.year() + '-' + (startMoment.month() + 1)].push({
                        	startMoment: startMoment,
                        	endMoment: endMoment
                    	});
                	}
                	view.calendarVC.setAlwaysState(result.alwaysFlag);
                	view.calendarVC.setSelections(selections);
					view.calendarVC.render();
				});
			});
		};

		renderSubmerchantForm = function() {
			var user = App.user.data;

			$('#addtechprofile-availability-submerchantform', this.$element).removeClass('hidden');
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
			}
			else {
				populateCountries($('#submerchantregistration-country', this.$element));
			}
			if(user.nationality && user.nationality !== '') {
				$('#submerchantregistration-nationality', this.$element).parent().addClass('hidden');
			}
			else {
				populateCountries($('#submerchantregistration-nationality', this.$element));
			}
			if(user.phone && user.phone !== '') {
				$('#submerchantregistration-phone', this.$element).parent().addClass('hidden');
			}
		};

		//TODO: move this into a utility module
		populateBirthdateInput = function() {
			var $inputContainer = $('.birthday-select', this.$element),
                $selectDay = $('#submerchantregistration-birthdate-date', $inputContainer),
                $selectMonth = $('#submerchantregistration-birthdate-month', $inputContainer),
                $selectYear = $('#submerchantregistration-birthdate-year', $inputContainer),
                html = '<option> - </option>',
                today = new Moment.tz(Localization.getCurrentTimeZone()),
                selectedYear = null,
                selectedMonth = null,
                maxYear, monthDays, i;

            selectedYear = $selectYear.val();
            maxYear = today.year() - Config.MIN_USER_AGE;
            for(i = 1914; i <= maxYear; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectYear.html(html);
            if(selectedYear !== null) {
                $selectYear.val(selectedYear);
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
            

            monthDays = new Moment.tz(selectedYear + '-' + selectedMonth + '-' + 1, 'YYYY-MM-DD', Localization.getCurrentTimeZone());
            monthDays = monthDays.endOf('month').date();
            html = '<option> - </option>';
            for(i = 1; i <= monthDays; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectDay.html(html);
            
            html = '';
		};

		handleBirthdateChange = function(event) {
			var view = event.data;
			view.populateBirthdateInput();
		};

		handleSubmerchantSubmit = function(event) {
			var view = event.data,
				user = App.user.data,
				tempUser = {},
				day, month, year, addressOneliner, $select, content, iban, swift, ibanRegEx, swiftRegEx;

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
                	return;
            	}
			}
			if(user.phone === null) {
				tempUser.phone = $('#submerchantregistration-phone', view.$element).val();
			}

			//Validate
			if(tempUser.birthdate === '' || tempUser.birthdate === 'Invalid date') {
                alert('The birthday field is required.');
                return;
            }
            if(tempUser.address === '') {
            	alert('The address field is required.');
            	return;
			}
			if(tempUser.postal_code === '') {
				alert('The postal code field is required.');
				return;
			}
			if(tempUser.city === '') {
				alert('The city field is required.');
				return;
			}
            if(tempUser.phone === '') {
                alert('The phone field is required.');
                return;
            }
            
            iban = $('#submerchantregistration-iban', view.$element).val();
			ibanRegEx = /^[a-zA-Z]{2}\d{2}\s*(\w{4}\s*){2,7}\w{1,4}\s*$/;
			iban = iban.match(ibanRegEx);
			if(iban === null) {
				alert('Please insert a correct IBAN.');
				return;
			}
			user.iban = iban[0];

            swift = $('#submerchantregistration-swift', view.$element).val();
			swiftRegEx = /^[a-zA-Z]{6}\w{2}(\w{3})?$/;
			swift = swift.match(swiftRegEx);
			if(swift === null) {
				alert('Please insert a correct SWIFT');
				return;
			}
			user.swift = swift[0];

            addressOneliner = tempUser.address + ', ' + tempUser.postal_code + ' ' + tempUser.city + ', ' + tempUser.country;
            geocoder.geocode({'address': addressOneliner}, function(results, status) {
                if(status === GoogleMaps.GeocoderStatus.OK) {
                	_.extend(user, tempUser);
                	view.showPanel('#addtechprofile-panel-submerchantTerms');
                }
                else {
                    alert('The address is not valid!');
                }
            });
		};

		handleSubmerchantAccept = function(event) {
			var view = event.data;

            view.toggleLoading();

			App.user.update(function(error) {
				if(error) {
					console.log(error);
					alert('Error saving user data.');
					view.toggleLoading();
					return;
				}
				App.user.updateBankDetails(function(error) {
					view.toggleLoading();
					if(error) {
						console.log(error);
						alert('Error registering bank data.');
						return;
					}
					$('#addtechprofile-availability-terms', view.$element).addClass('hidden');
					$('#addtechprofile-availability-calendar', view.$element).removeClass('hidden');
					$('#addtechprofile-next-btn', view.$element).removeClass('hidden');
					view.showPanel('#addtechprofile-panel-availability');
					view.renderAvailability();
					App.user.fetch(function(error) {
						if(error) {
							console.log('Error fetching user: ' + error);
						}
					});
				});
			});
		};

		saveAvailability = function() {
			var view = this,
				availabilityArray = [],
				selections, alwaysFlag, month, monthSelections, selection, j;

			if(view.isLoading === true) {
				return;
			}

			view.toggleLoading();

			if(view.calendarVC !== null) {
				selections = view.calendarVC.getSelections();
				alwaysFlag = view.calendarVC.getAlwaysFlag();
			}
			else {
				//For some reason the availability calendar did not load, so we set to never available as default.
				selections = {};
				alwaysFlag = 0;
			}

			for(month in selections) {
				monthSelections = selections[month];
				for(j = 0; j < monthSelections.length; j++) {
					selection = monthSelections[j];
					availabilityArray.push({
						start_time: selection.startMoment.format('YYYY-MM-DD') + ' 00:00:00',
						end_time: selection.endMoment.format('YYYY-MM-DD') + ' 23:59:59'
					});
				}
			}

      		view.newTechProfile.setAvailability(availabilityArray, alwaysFlag, function(error) {
      			if(error) {
      				alert('Error saving tech profile availability.');
      				console.log(error);
      				return;
      			}
      			view.toggleLoading();
      			$('.footer', view.$element).addClass('hidden');
      			view.showPanel('#addtechprofile-panel-final');
      			view.setupEvent('click', '.profile-btn', view, view.handleViewTechProfile);
      			view.setupEvent('click', '.addmore-btn', view, view.handleAddMoreTechProfiles);
      		});
        };

        handleCancel = function() {
        	App.router.closeModalView();
        };

		handleNext = function(event) {
			var view = event.data,
				currentTabID;

			currentTabID = view.getTabID();

			switch(currentTabID) {
				case 'addtechprofile-panel-type':
					view.saveTechProfile();
					break;
				case 'addtechprofile-panel-experience':
					view.saveExperience();
					break;
				case 'addtechprofile-panel-pricelocation':
					view.savePriceLocation();
					break;
				case 'addtechprofile-panel-submerchantForm':
					view.handleSubmerchantSubmit(event);
					break;
				case 'addtechprofile-panel-submerchantTerms':
					view.handleSubmerchantAccept(event);
					break;
				case 'addtechprofile-panel-availability':
					view.saveAvailability();
					break;
				default:
					console.log('Something went wrong.');
			}
		};

		handleViewTechProfile = function(event) {
			var view = event.data;
			App.router.closeModalView();
			App.router.navigateTo('techprofile/' + view.newTechProfile.data.id);
		};

		handleAddMoreTechProfiles = function() {
			App.router.closeModalView();
			App.router.openModalView('addtechprofile');
		};

		showPanel = function(panelID) {
			$('.addtechprofile-panel', this.$element).each(function() {
				var $this = $(this);
				if($this.hasClass('hidden') === false) {
					$this.addClass('hidden');
				}
			});
			$(panelID, this.$element).removeClass('hidden');
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			getTabID: getTabID,
			toggleLoading: toggleLoading,

			addTechProfileIcons: addTechProfileIcons,
			handleTechProfileRadio: handleTechProfileRadio,
			saveTechProfile: saveTechProfile,

			populateYearsOfExperience: populateYearsOfExperience,
			handleExperienceStartYearChange: handleExperienceStartYearChange,
			saveExperience: saveExperience,

			populatePriceSuggestions:populatePriceSuggestions,

			populateCountries: populateCountries,
			handlePriceChange: handlePriceChange,
			handleDeliveryCheckbox: handleDeliveryCheckbox,
			savePriceLocation: savePriceLocation,

			renderAvailability: renderAvailability,
			renderSubmerchantForm: renderSubmerchantForm,
			populateBirthdateInput: populateBirthdateInput,
			handleBirthdateChange: handleBirthdateChange,
			handleSubmerchantSubmit: handleSubmerchantSubmit,
			handleSubmerchantAccept: handleSubmerchantAccept,
			handleAvailabilityNext: handleAvailabilityNext,
			saveAvailability: saveAvailability,
			
			handleCancel: handleCancel,
			handleNext: handleNext,
			handleViewTechProfile: handleViewTechProfile,
			handleAddMoreTechProfiles: handleAddMoreTechProfiles,

			showPanel: showPanel
		});
	}
);