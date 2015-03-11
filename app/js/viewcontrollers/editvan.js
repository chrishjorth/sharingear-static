/**
 * Controller for the Sharingear Edit vans page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/van', 'models/localization', 'googlemaps','utilities', 'moment', 'config'],
	function(_, $, ViewController, App, Van, Localization, GoogleMaps, Utilities, Moment, Config) {
		var geocoder,

            didInitialize,
            didRender,

            toggleLoading,

            populateBrandSelect,
            populateSubtypeSelect,
			populateAccessories,
            handleSubtypeChange,

            populateImages,
            handleImageUpload,

            populateLocation,
            populateCountries,
            populateDelivery,
            handleDeliveryCheckbox,

			initAccessories,
            populatePricing,
			populatePriceSuggestions,

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

			this.van = this.passedData;
			this.templateParameters = this.van.data;
            this.templateParameters.currency = App.user.data.currency;

            this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
		};

		didRender = function() {
			this.populateImages();
            this.populateCountries($('#editvanpricing-country', this.$element));
            this.populateLocation();
            this.populateDelivery();
            this.renderAvailability();

			if(this.van.data.subtype === '') {
				$('#editvan-subtype').prop('selectedIndex', 0); // if no subtype is passed, 'Choose type:' by default
			}
			else {
				$('#editvan-subtype', this.$element).val(this.van.data.subtype);
			}

			if(this.van.data.brand === '') {
				$('#editvan-brand').prop('selectedIndex', 0); // if no brand is passed, 'Choose brand:' by default
			}
			else {
				$('#editvan-brand', this.$element).val(this.van.data.brand);
			}

            if(this.van.data.country === '') {
                $('#editvanpricingloc-form #editvanpricing-country').prop('selectedIndex', 0); // if no country is passed, 'Choose country:' by default
            }
            else {
                $('#editvanpricingloc-form #editvanpricing-country', this.$element).val(this.van.data.country);
            }

			this.initAccessories();
            this.populatePricing();
			this.populatePriceSuggestions();

            this.setupEvent('click', '#editvan-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#editvan-save-btn', this, this.handleSave);
            this.setupEvent('change', '#editvan-photos-form-imageupload', this, this.handleImageUpload);
            this.setupEvent('change', '#van-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#editvan-subtype', this, this.handleSubtypeChange);

            this.setupEvent('change', '#submerchantregistration-birthdate-year, #submerchantregistration-birthdate-month', this, this.handleBirthdateChange);
        };

        toggleLoading = function() {
            if(this.isLoading === true) {
                $('#editvan-save-btn', this.$element).html('Save');
                this.isLoading = false;
            }
            else {
                $('#editvan-save-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
                this.isLoading = true;
            }
        };

        populateDelivery = function(){
            var price = this.van.data.delivery_price ? this.van.data.delivery_price : '',
                distance = this.van.data.delivery_distance ? this.van.data.delivery_distance : '';

            $('#editvanpricingloc-form #delivery_price').val(price);
            $('#editvanpricingloc-form #delivery_distance').val(distance);
        };

		initAccessories = function () {
			var vanClassification = App.contentClassification.data.vanClassification,
				view = this,
                html = '',
				i, j;

			i = 0;
            while(i < vanClassification.length) {
                if(vanClassification[i].vanType === view.van.data.van_type) {
                    for(j = 0; j < vanClassification[i].accessories.length; j++) {
                        if(view.van.data.accessories !== null && view.van.data.accessories.indexOf(vanClassification[i].accessories[j]) > -1) {
                            html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '" checked> ' + vanClassification[i].accessories[j];
                        }
                        else {
                            html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '"> ' + vanClassification[i].accessories[j];
                        }
                    }
                    i = vanClassification.length;
                }
                i++;
            }
			$('#editvan-accessories-container', view.$element).html(html);
		};

        renderAvailability = function() {
            var view = this,
                $calendarContainer;
            if(App.user.isSubMerchant() === true) {
                $calendarContainer = $('#editvan-availability-calendar', this.$element);
                $calendarContainer.removeClass('hidden');
                require(['viewcontrollers/availabilitycalendar', 'text!../templates/availabilitycalendar.html'], function(calendarVC, calendarVT) {
                    view.calendarVC = new calendarVC.constructor({name: 'availabilitycalendar', $element: $calendarContainer, template: calendarVT, passedData: view.van});
                    view.calendarVC.initialize();
                    view.calendarVC.render();
                });
            }
            else {
                var user = App.user.data;

                $('#editvan-availability-submerchantform', this.$element).removeClass('hidden');

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

                this.setupEvent('submit', '#editvan-submerchantform', this, this.handleSubmerchantSubmit);
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

            addressOneliner = tempUser.address + ', ' + tempUser.postal_code + ' ' + tempUser.city + ', ' + tempUser.country;
            geocoder.geocode({'address': addressOneliner}, function(results, status) {
                if(status === GoogleMaps.GeocoderStatus.OK) {
                    _.extend(user, tempUser);
                    $('#editvan-availability-submerchantform', view.$element).addClass('hidden');
                    $('#editvan-availability-terms', view.$element).removeClass('hidden');
                }
                else {
                    alert('Google Maps could not find your address. Please verify that it is correct.');
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
                    $('#editvan-availability-terms', view.$element).addClass('hidden');
                    $('#editvan-availability-calendar', view.$element).removeClass('hidden');
                    view.renderAvailability();
                    App.user.fetch(function(error) {
                        if(error) {
                            console.log('Error fetching user: ' + error);
                        }
                    });
                });
            });
        };

        populateLocation = function() {
            $('#editvanpricing-city', this.$element).val(this.van.data.city);
            $('#editvanpricing-address', this.$element).val(this.van.data.address);
            $('#editvanpricing-postalcode', this.$element).val(this.van.data.postal_code);
            $('#editvanpricing-region', this.$element).val(this.van.data.region);
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

		populateImages = function() {
			var images = this.van.data.images.split(','),
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {
					html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
				}
			}
			$('#editvan-photos-form .thumb-list-container ul', this.$element).append(html);
		};

        populatePricing = function() {
            var view = this;
            Localization.convertPrices([this.van.data.price_a, this.van.data.price_b, this.van.data.price_c], this.van.data.currency, App.user.data.currency, function(error, convertedPrices) {
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
			var vanClassification = App.contentClassification.data.vanClassification,
                view = this,
                i, suggestionA, suggestionB, suggestionC;

            for(i = 0; i < vanClassification.length; i++) {
                if(vanClassification[i].vanType === view.van.data.van_type) {
                    suggestionA = vanClassification[i].price_a_suggestion;
                    suggestionB = vanClassification[i].price_b_suggestion;
                    suggestionC = vanClassification[i].price_c_suggestion;
                    i = vanClassification.length;
                }
            }
            Localization.convertPrices([suggestionA, suggestionB, suggestionC], 'EUR', App.user.data.currency, function(error, convertedPrices) {
                if(error) {
                    console.log('Could not convert price suggestions: ' + error);
                    return;
                }
                $('#editvan-price_a-suggestion', view.$element).html(Math.ceil(convertedPrices[0]));
                $('#editvan-price_b-suggestion', view.$element).html(Math.ceil(convertedPrices[1]));
                $('#editvan-price_c-suggestion', view.$element).html(Math.ceil(convertedPrices[2]));
            });
		};

		populateAccessories = function (event) {
            var vanClassification = App.contentClassification.data.vanClassification,
                view = event.data,
                html = '',
                vanType, i, j;

			i = 0;
            while(i < vanClassification.length) {
                if(vanClassification[i].vanType === vanType) {
                    for(j = 0; j < vanClassification[i].accessories.length; j++) {
                        if(view.van.data.accessories !== null && view.van.data.accessories.indexOf(vanClassification[i].accessories[j]) > -1) {
                            html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '" checked> ' + vanClassification[i].accessories[j];
                        }
                        else {
                            html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '"> ' + vanClassification[i].accessories[j];
                        }
                    }
                    i = vanClassification.length;
                }
                i++;
            }

            $('#editvan-accessories-container', view.$element).html(html);
		};

        handleDeliveryCheckbox = function(){
            if(this.checked === true) {
                $(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled');
            }
            else {
                $(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
            }
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

		handleImageUpload = function(event) {
			var view = event.data,
				$file = $(this);

            view.toggleLoading();

			view.van.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), function(error, url) {
				var $thumbList, html;
				$('#editvan-form-imageupload').val('');
				if(error) {
					alert('Error uploading file.');
					console.log(error);
                    view.toggleLoading();
					return;
				}

				$thumbList = $('#editvan-photos-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Van thumb"></li>';
				$thumbList.append(html);

                view.toggleLoading();
			});
		};

		handleSave = function(event) {
			var view = event.data,
                isLocationSame = false,
                currentAddress = view.van.data.address,
                currentPostalCode = view.van.data.postal_code,
                currentCity = view.van.data.city,
                currentRegion = view.van.data.region,
                currentCountry = view.van.data.country,
                availabilityArray = [],
				accessoriesArray = [],
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

                view.van.setAvailability(availabilityArray, alwaysFlag, function(error) {
                    if(error) {
                        alert('Error saving availability.');
                        console.log(error);
                        view.toggleLoading();
                    }
                });
            }

			//Push the checked checkboxes to the array
            $('#editvan-accessories-container input:checked', view.$element).each(function() {
                accessoriesArray.push(this.name);
            });

			updatedVanData = {
				brand: $('#editvan-brand option:selected', view.$element).val(),
				subtype: $('#editvan-subtype option:selected', view.$element).val(),
				model: $('#editvan-model', view.$element).val(),
				description: $('#editvan-description', view.$element).val(),
				price_a: $('#editvanpricing-form #price_a', this.$element).val(),
				price_b: $('#editvanpricing-form #price_b', this.$element).val(),
				price_c: $('#editvanpricing-form #price_c', this.$element).val(),
                currency: App.user.data.currency,
                //delivery_price: '',
                //delivery_distance: '',
				accessories: accessoriesArray,
				address: $('#editvanpricing-address', this.$element).val(),
				postal_code: $('#editvanpricing-postalcode', this.$element).val(),
				city: $('#editvanpricing-city', this.$element).val(),
				region: $('#editvanpricing-region', this.$element).val(),
				country: $('#editvanpricing-country option:selected').val()
            };

            if ($('#editvan-subtype', view.$element).selectedIndex === 0) {
                alert('The subtype field is required.');
				view.toggleLoading();
                return;
            }
            if ($('#editvan-brand', view.$element).selectedIndex === 0) {
                alert('The brand field is required.');
				view.toggleLoading();
				return;
            }
            if ($('#editvan-model', view.$element).val() === '') {
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
            if ($('#editvanpricing-address', this.$element).val() === '') {
                alert('The address field is required.');
                view.toggleLoading();               
				return;
            }
            if ($('#editvanpricing-postalcode', this.$element).val() === '') {
                alert('The postalcode field is required.');
                view.toggleLoading();                
				return;
            }
            if ($('#editvanpricing-city', this.$element).val() === '') {
                alert('The city field is required.');
                view.toggleLoading(); 
				return;
            }
            if ($('#editvanpricing-country').selectedIndex === 0 || $('#editvanpricing-country').selectedIndex === null) {
                alert('The country field is required.');
                view.toggleLoading();                 
				return;
            }
            _.extend(view.van.data, updatedVanData);

			updateCall = function() {
				view.van.save(function(error) {
                    if(error) {
                        alert('Error updating van.');
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
				addressOneliner = updatedVanData.address + ', ' + updatedVanData.postal_code + ' ' + updatedVanData.city + ', ' + updatedVanData.country;
				geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.van.data.longitude = results[0].geometry.location.lng();
						view.van.data.latitude = results[0].geometry.location.lat();
						updateCall();
					}
					else {
                        alert('Google Maps could not find your address. Please verify that it is correct.');
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

            populateBrandSelect: populateBrandSelect,
            populateSubtypeSelect: populateSubtypeSelect,
			populateAccessories:populateAccessories,
            handleSubtypeChange: handleSubtypeChange,

            populateImages: populateImages,
            handleImageUpload: handleImageUpload,

            populateLocation: populateLocation,
            populateCountries: populateCountries,
            populateDelivery:populateDelivery,
            handleDeliveryCheckbox:handleDeliveryCheckbox,
			handlePriceChange:handlePriceChange,

			initAccessories:initAccessories,
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
