/**
 * Controller for the Sharingear Edit tech profile page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/techprofile', 'models/localization', 'googlemaps','utilities', 'moment', 'config'],
	function(_, $, ViewController, App, TechProfile, Localization, GoogleMaps, Utilities, Moment, Config) {
		var geocoder,

            didInitialize,
            didRender,

            toggleLoading,

            populateExperience,
            populateYearsOfExperience,
            populateLocation,
            populateCountries,

            populatePricing,
			populatePriceSuggestions,
            handleExperienceStartYearChange,

            renderAvailability,
            populateBirthdateInput,
            handleBirthdateChange,
            handleSubmerchantSubmit,
            handleSubmerchantAccept,
			handlePriceChange,

            handleCancel,
            handleSave;

        geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
            Moment.locale('en-custom', {
                week: {
                    dow: 1,
                    doy: 4
                }
            });

            this.isLoading = false;

			this.techProfile = this.passedData;
			this.templateParameters = this.techProfile.data;
            this.templateParameters.currency = App.user.data.currency;

            this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
		};

		didRender = function() {
            this.populateExperience();
            this.populateCountries($('#edittechprofilepricing-country', this.$element));
            this.populateLocation();
            this.renderAvailability();

			if(this.techProfile.data.subtype === '') {
				$('#edittechprofile-subtype').prop('selectedIndex', 0); // if no subtype is passed, 'Choose type:' by default
			}
			else {
				$('#edittechprofile-subtype', this.$element).val(this.techProfile.data.subtype);
			}

			if(this.techProfile.data.brand === '') {
				$('#edittechprofile-brand').prop('selectedIndex', 0); // if no brand is passed, 'Choose brand:' by default
			}
			else {
				$('#edittechprofile-brand', this.$element).val(this.techProfile.data.brand);
			}

            if(this.techProfile.data.country === '') {
                $('#edittechprofilepricing-country').prop('selectedIndex', 0); // if no country is passed, 'Choose country:' by default
            }
            else {
                $('#edittechprofilepricing-country', this.$element).val(this.techProfile.data.country);
            }

            this.populatePricing();
			this.populatePriceSuggestions();

            this.setupEvent('click', '#edittechprofile-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#edittechprofile-save-btn', this, this.handleSave);
            this.setupEvent('change', '#edittechprofile-photos-form-imageupload', this, this.handleImageUpload);
			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#edittechprofile-subtype', this, this.handleSubtypeChange);

            this.setupEvent('click', '#edittechprofile-startyear', this, this.handleExperienceStartYearChange);

            this.setupEvent('change', '#submerchantregistration-birthdate-year, #submerchantregistration-birthdate-month', this, this.handleBirthdateChange);
        };

        toggleLoading = function() {
            if(this.isLoading === true) {
                $('#edittechprofile-save-btn', this.$element).html('Save');
                this.isLoading = false;
            }
            else {
                $('#edittechprofile-save-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
                this.isLoading = true;
            }
        };

        renderAvailability = function() {
            var view = this,
                $calendarContainer;
            if(App.user.isSubMerchant() === true) {
                $calendarContainer = $('#edittechprofile-availability-calendar', this.$element);
                $calendarContainer.removeClass('hidden');
                require(['viewcontrollers/availabilitycalendar', 'text!../templates/availabilitycalendar.html'], function(calendarVC, calendarVT) {
                    view.calendarVC = new calendarVC.constructor({name: 'availabilitycalendar', $element: $calendarContainer, template: calendarVT, passedData: view.techProfile});
                    view.calendarVC.initialize();
                    view.calendarVC.render();
                });
            }
            else {
                var user = App.user.data;

                $('#edittechprofile-availability-submerchantform', this.$element).removeClass('hidden');

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

                this.setupEvent('submit', '#edittechprofile-submerchantform', this, this.handleSubmerchantSubmit);
                this.setupEvent('click', '#submerchantregistration-accept', this, this.handleSubmerchantAccept);
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
            if(tempUser.birthdate === '') {
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

            addressOneliner = tempUser.address + ', ' + tempUser.postal_code + ' ' + tempUser.city + ', ' + tempUser.region + ', ' + tempUser.country;
            geocoder.geocode({'address': addressOneliner}, function(results, status) {
                if(status === GoogleMaps.GeocoderStatus.OK) {
                    _.extend(user, tempUser);
                    $('#edittechprofile-availability-submerchantform', view.$element).addClass('hidden');
                    $('#edittechprofile-availability-terms', view.$element).removeClass('hidden');
                }
                else {
                    alert('The address is not valid!');
                }
            });
        };

        handleSubmerchantAccept = function(event) {
            var view = event.data,
                currentBtn = $(this);

            currentBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin"></i>');
            App.user.update(function(error) {
                if(error) {
                    console.log(error);
                    alert('Error saving user data.');
                    return;
                }
                App.user.updateBankDetails(function(error) {
                    if(error) {
                        console.log(error);
                        alert('Error registering bank data.');
                        return;
                    }
                    $('#edittechprofile-availability-terms', view.$element).addClass('hidden');
                    $('#edittechprofile-availability-calendar', view.$element).removeClass('hidden');
                    view.renderAvailability();
                    App.user.fetch(function(error) {
                        if(error) {
                            console.log('Error fetching user: ' + error);
                        }
                    });
                });
            });
        };

        populateExperience = function() {
            var xp_years = this.techProfile.data.xp_years.split('-'),
                level = 5;
            switch(this.techProfile.data.experience) {
                case 'A+':
                    level = 1;
                    break;
                case 'A':
                    level = 2;
                    break;
                case 'B':
                    level = 3;
                    break;
                case 'C':
                    level = 4;
                    break;
            }
            $('#edittechprofile-experience', this.$element).val(level);
            this.populateYearsOfExperience();
            if(xp_years[0]) {
                $('#edittechprofile-startyear', this.$element).val(xp_years[0]);
            }
            else {
                $('#edittechprofile-startyear', this.$element).val('-');
            }
            if(xp_years[1]) {
                $('#edittechprofile-endyear', this.$element).val(xp_years[1]);
            }
            else {
                $('#edittechprofile-endyear', this.$element).val('-');
            }
        };

        populateYearsOfExperience = function() {
            var $startYear = $('#edittechprofile-startyear', this.$element),
                $endYear = $('#edittechprofile-endyear', this.$element),
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
            startYearSelectHTML += '<option value="-">start year</option>';
            endYearSelectHTML += '<option value="-">end year</option>';
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

        populateLocation = function() {
            $('#edittechprofilepricing-city', this.$element).val(this.techProfile.data.city);
            $('#edittechprofilepricing-address', this.$element).val(this.techProfile.data.address);
            $('#edittechprofilepricing-postalcode', this.$element).val(this.techProfile.data.postal_code);
            $('#edittechprofilepricing-region', this.$element).val(this.techProfile.data.region);
        };

        populateCountries = function($select) {
            var countriesArray = Localization.getCountries(),
                html = $('option', $select).first()[0].outerHTML,
                i;
            for(i = 0; i < countriesArray.length; i++) {
                html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m){ return m.toUpperCase(); }) + '</option>';
            }
            $select.html(html);
        };

        populatePricing = function() {
            var view = this;
            Localization.convertPrices([this.techProfile.data.price_a, this.techProfile.data.price_b, this.techProfile.data.price_c], this.techProfile.data.currency, App.user.data.currency, function(error, convertedPrices) {
                if(error) {
                    console.log('Could not convert prices: ' + error);
                    return;
                }
                $('#price_a', view.$element).val(Math.ceil(convertedPrices[0]));
                $('#price_b', view.$element).val(Math.ceil(convertedPrices[1]));
                $('#price_c', view.$element).val(Math.ceil(convertedPrices[2]));
            });
        };

		populatePriceSuggestions = function () {
			var techProfileClassification = App.contentClassification.data.roadieClassification,
                view = this,
                i, suggestionA, suggestionB, suggestionC;

            for(i = 0; i < techProfileClassification.length; i++) {
                if(techProfileClassification[i].roadie_type === view.techProfile.data.roadie_type) {
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
                $('#edittechprofile-price_a-suggestion', view.$element).html(Math.ceil(convertedPrices[0]));
                $('#edittechprofile-price_b-suggestion', view.$element).html(Math.ceil(convertedPrices[1]));
                $('#edittechprofile-price_c-suggestion', view.$element).html(Math.ceil(convertedPrices[2]));
            });
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

		handleCancel = function() {
            var currentVerticalPosition = $(window).scrollTop();
            App.router.closeModalView();
            $('body, html').animate({scrollTop: currentVerticalPosition},50);
		};

		handleSave = function(event) {
			var view = event.data,
                isLocationSame = false,
                currentAddress = view.techProfile.data.address,
                currentPostalCode = view.techProfile.data.postal_code,
                currentCity = view.techProfile.data.city,
                currentRegion = view.techProfile.data.region,
                currentCountry = view.techProfile.data.country,
                availabilityArray = [],
                selections, alwaysFlag, updatedVanData, addressOneliner, updateCall, month, monthSelections, selection, j;

            if(view.isLoading === true) {
                return;
            }

			view.toggleLoading();

            //If user has not registered as submerchant, the calendar view is not loaded
            if(view.calendarVC && view.calendarVC !== null) {
                selections = view.calendarVC.getSelections();
                alwaysFlag = view.calendarVC.getAlwaysFlag();

                //Convert selections to availability array
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

                view.techProfile.setAvailability(availabilityArray, alwaysFlag, function(error) {
                    if(error) {
                        alert('Error saving availability.');
                        console.log(error);
                        view.toggleLoading();
                    }
                });
            }

			updatedVanData = {
				about: $('#edittechprofile-about', view.$element).val(),
                currently: $('#edittechprofile-currently', view.$element).val(),
                genres: $('#edittechprofile-genres', view.$element).val(),
                experience: $('#edittechprofile-experience', view.$element).val(),
                xp_years: $('#edittechprofile-startyear', view.$element).val() + '-' + $('#edittechprofile-endyear', view.$element).val(),
                tours: $('#edittechprofile-tours', this.$element).val(),
                companies: $('#edittechprofile-companies', this.$element).val(),
                bands: $('#edittechprofile-bands', this.$element).val(),
				price_a: $('#price_a', this.$element).val(),
				price_b: $('#price_b', this.$element).val(),
				price_c: $('#price_c', this.$element).val(),
                currency: App.user.data.currency,
				address: $('#edittechprofilepricing-address', this.$element).val(),
				postal_code: $('#edittechprofilepricing-postalcode', this.$element).val(),
				city: $('#edittechprofilepricing-city', this.$element).val(),
				region: $('#edittechprofilepricing-region', this.$element).val(),
				country: $('#edittechprofilepricing-country option:selected').val()
            };

            if ($('#edittechprofile-subtype', view.$element).selectedIndex === 0) {
                alert('The subtype field is required.');
				view.toggleLoading();
                return;
            }
            if ($('#edittechprofile-brand', view.$element).selectedIndex === 0) {
                alert('The brand field is required.');
				view.toggleLoading();
				return;
            }
            if ($('#edittechprofile-model', view.$element).val() === '') {
                alert('The model field is required.');
                view.toggleLoading();
				return;
            }
            if ($('#price_a', this.$element).val() === '') {
                alert('The rental price field is required.');
                view.toggleLoading();
				return;
            }
			if (parseFloat($('#price_a', this.$element).val())%1!==0) {
				alert('The hourly rental price is invalid.');
				view.toggleLoading();
				return;
			}
            if ($('#price_b', this.$element).val() === '') {
                alert('The rental price field is required.');
                view.toggleLoading();
				return;
            }
			if (parseFloat($('#price_b', this.$element).val())%1!==0) {
				alert('The daily rental price is invalid.');
				view.toggleLoading();
				return;
			}
            if ($('#price_c', this.$element).val() === '') {
                alert('The rental price field is required.');
                view.toggleLoading();
				return;
            }
			if (parseFloat($('#price_c', this.$element).val())%1!==0) {
				alert('The weekly rental price is invalid.');
				view.toggleLoading();
				return;
			}
            if ($('#edittechprofilepricing-address', this.$element).val() === '') {
                alert('The address field is required.');
                view.toggleLoading();               
				return;
            }
            if ($('#edittechprofilepricing-postalcode', this.$element).val() === '') {
                alert('The postalcode field is required.');
                view.toggleLoading();                
				return;
            }
            if ($('#edittechprofilepricing-city', this.$element).val() === '') {
                alert('The city field is required.');
                view.toggleLoading(); 
				return;
            }
            if ($('#edittechprofilepricing-country').selectedIndex === 0 || $('#edittechprofilepricing-country').selectedIndex === null) {
                alert('The country field is required.');
                view.toggleLoading();                 
				return;
            }
            _.extend(view.techProfile.data, updatedVanData);

			updateCall = function() {
				view.techProfile.save(function(error) {
                    if(error) {
                        alert('Error updating technician profile.');
                        console.log(error);
                        view.toggleLoading();
                        return;
					}
					App.router.closeModalView();
				});
			};

			isLocationSame = (currentAddress === updatedVanData.address &&
				currentPostalCode === updatedVanData.postal_code &&
				currentCity === updatedVanData.city &&
				currentRegion === updatedVanData.region &&
				currentCountry === updatedVanData.country);

			if(isLocationSame === false) {
				addressOneliner = updatedVanData.address + ', ' + updatedVanData.postal_code + ' ' + updatedVanData.city + ', ' + updatedVanData.region + ', ' + updatedVanData.country;
				geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.techProfile.data.longitude = results[0].geometry.location.lng();
						view.techProfile.data.latitude = results[0].geometry.location.lat();
						updateCall();
					}
					else {
                        alert('The address is not valid!');
                        view.toggleLoading();
					}
				});
			}
			else {
				updateCall();
			}
		};

        return ViewController.inherit({
            didInitialize: didInitialize,
            didRender: didRender,

            toggleLoading: toggleLoading,

            populateExperience: populateExperience,
            populateYearsOfExperience: populateYearsOfExperience,
            handleExperienceStartYearChange: handleExperienceStartYearChange,
            populateLocation: populateLocation,
            populateCountries: populateCountries,
			handlePriceChange:handlePriceChange,

            renderAvailability:renderAvailability,
            populateBirthdateInput: populateBirthdateInput,
            handleBirthdateChange: handleBirthdateChange,
            handleSubmerchantSubmit: handleSubmerchantSubmit,
            handleSubmerchantAccept: handleSubmerchantAccept,

            populatePricing: populatePricing,
			populatePriceSuggestions:populatePriceSuggestions,

            handleCancel: handleCancel,
            handleSave: handleSave
        });

	}
);
