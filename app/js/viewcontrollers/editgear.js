/**
 * Controller for the Sharingear Edit gear page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gear', 'models/localization', 'googlemaps','utilities', 'moment', 'config'],
	function(_, $, ViewController, App, Gear, Localization, GoogleMaps, Utilities, Moment, Config) {
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

			this.gear = this.passedData;
			this.templateParameters = this.gear.data;
            this.templateParameters.currency = App.user.data.currency;

            this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
		};

		didRender = function() {
			this.populateBrandSelect();
			this.populateSubtypeSelect();

			this.populateImages();
            this.populateCountries($('#editgearpricing-country', this.$element));
            this.populateLocation();
            this.populateDelivery();
            this.renderAvailability();

			if(this.gear.data.subtype === '') {
				$('#editgear-subtype').prop('selectedIndex', 0); // if no subtype is passed, 'Choose type:' by default
			}
			else {
				$('#editgear-subtype', this.$element).val(this.gear.data.subtype);
			}

			if(this.gear.data.brand === '') {
				$('#editgear-brand').prop('selectedIndex', 0); // if no brand is passed, 'Choose brand:' by default
			}
			else {
				$('#editgear-brand', this.$element).val(this.gear.data.brand);
			}

            if(this.gear.data.country === '') {
                $('#editgearpricingloc-form #editgearpricing-country').prop('selectedIndex', 0); // if no country is passed, 'Choose country:' by default
            }
            else {
                $('#editgearpricingloc-form #editgearpricing-country', this.$element).val(this.gear.data.country);
            }

			this.initAccessories();
            this.populatePricing();
			this.populatePriceSuggestions();

            this.setupEvent('click', '#editgear-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#editgear-save-btn', this, this.handleSave);
            this.setupEvent('change', '#editgear-photos-form-imageupload', this, this.handleImageUpload);
            this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#editgear-subtype', this, this.handleSubtypeChange);

            this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
            this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
            this.setupEvent('click', '#gearavailability-next-btn', this, this.handleNextButton);
            this.setupEvent('click', '#gearavailability-clearmonth-btn', this, this.handleClearMonth);
            this.setupEvent('click', '#gearavailability-always-btn', this, this.handleAlwaysAvailable);
            this.setupEvent('click', '#gearavailability-never-btn', this, this.handleNeverAvailable);
            this.setupEvent('mousedown touchstart', '#gearavailability-months-container .day-row .day', this, this.handleDayStartSelect);
            this.setupEvent('change', '#submerchantregistration-birthdate-year, #submerchantregistration-birthdate-month', this, this.handleBirthdateChange);
        };

        toggleLoading = function() {
            if(this.isLoading === true) {
                $('#editgear-save-btn', this.$element).html('Save');
                this.isLoading = false;
            }
            else {
                $('#editgear-save-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
                this.isLoading = true;
            }
        };

        populateDelivery = function(){
            var price = this.gear.data.delivery_price ? this.gear.data.delivery_price : '',
                distance = this.gear.data.delivery_distance ? this.gear.data.delivery_distance : '';

            $('#editgearpricingloc-form #delivery_price').val(price);
            $('#editgearpricingloc-form #delivery_distance').val(distance);
        };

		initAccessories = function () {
			var gearClassification = App.contentClassification.data.gearClassification,
				html = '',
				view,gearSubtypes,i;

			view = this;

			gearSubtypes = gearClassification[view.gear.data.gear_type];

			for(i = 0; i < gearSubtypes.length; i++) {
				if (gearSubtypes[i].subtype === $('#editgear-subtype',view.$element).val()) {
					var j;
					for(j=0;j<gearSubtypes[i].accessories.length;j++){

						//Check the checkbox if the specific accessory was selected for this gear before
						if (view.gear.data.accessories.indexOf(gearSubtypes[i].accessories[j])>-1) {
							html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'" checked> '+gearSubtypes[i].accessories[j];
						}else{
							html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'"> '+gearSubtypes[i].accessories[j];
						}
					}
				}
			}
			$('#editgear-accessories-container',view.$element).html(html);
		};

        renderAvailability = function() {
            var view = this,
                $calendarContainer;
            if(App.user.isSubMerchant() === true) {
                $calendarContainer = $('#editgear-availability-calendar', this.$element);
                $calendarContainer.removeClass('hidden');
                require(['viewcontrollers/availabilitycalendar', 'text!../templates/availabilitycalendar.html'], function(calendarVC, calendarVT) {
                    view.calendarVC = new calendarVC.constructor({name: 'availabilitycalendar', $element: $calendarContainer, template: calendarVT, passedData: view.gear});
                    view.calendarVC.initialize();
                    view.calendarVC.render();
                });
            }
            else {
                var user = App.user.data;

                $('#editgear-availability-submerchantform', this.$element).removeClass('hidden');

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

                this.setupEvent('submit', '#editgear-submerchantform', this, this.handleSubmerchantSubmit);
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
                    $('#editgear-availability-submerchantform', view.$element).addClass('hidden');
                    $('#editgear-availability-terms', view.$element).removeClass('hidden');
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
                    $('#editgear-availability-terms', view.$element).addClass('hidden');
                    $('#editgear-availability-calendar', view.$element).removeClass('hidden');
                    view.alwaysFlag = 1; //Gear is always available as default
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
            $('#editgearpricingloc-form #editgearpricing-city').val(this.gear.data.city);
            $('#editgearpricingloc-form #editgearpricing-address').val(this.gear.data.address);
            $('#editgearpricingloc-form #editgearpricing-postalcode').val(this.gear.data.postal_code);
            $('#editgearpricingloc-form #editgearpricing-region').val(this.gear.data.region);
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

		populateBrandSelect = function() {
			var brands = App.contentClassification.data.gearBrands,
				html = '<option> Choose brand: </option>',
				$brandSelect, i;
			if(!brands) {
				brands = [];
			}

			$brandSelect = $('#editgear-brand', this.$element);
			$brandSelect.empty();

			for(i = 0; i < brands.length; i++) {
				html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
			}
			$brandSelect.append(html);
		};

		populateSubtypeSelect = function() {
			var gearClassification = App.contentClassification.data.gearClassification,
				html = '<option> Choose subtype: </option>',
				$subtypeSelect,
				gearSubtypes, i;
			$subtypeSelect = $('#editgear-subtype', this.$element);
			$subtypeSelect.empty();

			gearSubtypes = gearClassification[this.gear.data.gear_type];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i].subtype + '">' + gearSubtypes[i].subtype + '</option>';
			}
			$subtypeSelect.append(html);
		};

        handleSubtypeChange = function(event) {
            var view = event.data;
            view.populateAccessories();
            view.populatePriceSuggestions();
        };

		populateImages = function() {
			var images = this.gear.data.images.split(','),
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {
					html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
				}
			}
			$('#editgear-photos-form .thumb-list-container ul', this.$element).append(html);
		};

        populatePricing = function() {
            var view = this;
            Localization.convertPrices([this.gear.data.price_a, this.gear.data.price_b, this.gear.data.price_c], this.gear.data.currency, App.user.data.currency, function(error, convertedPrices) {
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
			var gearClassification = App.contentClassification.data.gearClassification,
                view, gearSubtypes, i, suggestionA, suggestionB, suggestionC;

            view = this;

            gearSubtypes = gearClassification[view.gear.data.gear_type];
            for(i = 0; i < gearSubtypes.length; i++) {
                if (gearSubtypes[i].subtype === $('#editgear-subtype', view.$element).val()) {
                    suggestionA = gearSubtypes[i].price_a_suggestion;
                    suggestionB = gearSubtypes[i].price_b_suggestion;
                    suggestionC = gearSubtypes[i].price_c_suggestion;
                    i = gearSubtypes.length;
                }
            }
            Localization.convertPrice(suggestionA, App.user.data.currency, function(error, convertedPrice) {
                if(error) {
                    console.log('Could not convert price: ' + error);
                    return;
                }
                $('#editgear-price_a-suggestion').html(Math.ceil(convertedPrice));
            });
            Localization.convertPrice(suggestionB, App.user.data.currency, function(error, convertedPrice) {
                if(error) {
                    console.log('Could not convert price: ' + error);
                    return;
                }
                $('#editgear-price_b-suggestion').html(Math.ceil(convertedPrice));
            });
            Localization.convertPrice(suggestionC, App.user.data.currency, function(error, convertedPrice) {
                if(error) {
                    console.log('Could not convert price: ' + error);
                    return;
                }
                $('#editgear-price_c-suggestion').html(Math.ceil(convertedPrice));
            });
		};

		populateAccessories = function (event) {
            var gearClassification = App.contentClassification.data.gearClassification,
                html = '',
                view,gearSubtypes,i;
			
            view = event.data;

			gearSubtypes = gearClassification[view.gear.data.gear_type];
			for(i = 0; i < gearSubtypes.length; i++) {
				if (gearSubtypes[i].subtype === $('#editgear-subtype',this.$element).val()) {
					var j;
					for(j = 0;j<gearSubtypes[i].accessories.length;j++){

						//Check the checkbox if the specific accessory was selected for this gear before
						if (view.gear.data.accessories.indexOf(gearSubtypes[i].accessories[j])>-1) {
							html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'" checked> '+gearSubtypes[i].accessories[j];
						}else{
							html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'"> '+gearSubtypes[i].accessories[j];
						}
					}
				}
			}
            $('#editgear-accessories-container',this.$element).html(html);
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

			view.gear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
				var $thumbList, html;
				$('#editgear-form-imageupload').val('');
				if(error) {
					alert('Error uploading file.');
					console.log(error);
                    view.toggleLoading();
					return;
				}

				$thumbList = $('#editgear-photos-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);

                view.toggleLoading();
			});
		};

		handleSave = function(event) {
			var view = event.data,
                isLocationSame = false,
                currentAddress = view.gear.data.address,
                currentPostalCode = view.gear.data.postal_code,
                currentCity = view.gear.data.city,
                currentRegion = view.gear.data.region,
                currentCountry = view.gear.data.country,
                availabilityArray = [],
				accessoriesArray = [],
                selections, alwaysFlag, updatedGearData, addressOneliner, updateCall, month, monthSelections, selection, j;

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

                view.gear.setAvailability(App.user.data.id, availabilityArray, alwaysFlag, function(error) {
                    if(error) {
                        alert('Error saving availability.');
                        console.log(error);
                        view.toggleLoading();
                    }
                });
            }

			//Push the checked checkboxes to the array
            $('#editgear-accessories-container input:checked', view.$element).each(function() {
                accessoriesArray.push(this.name);
            });

			updatedGearData = {
				brand: $('#editgear-brand option:selected', view.$element).val(),
				subtype: $('#editgear-subtype option:selected', view.$element).val(),
				model: $('#editgear-model', view.$element).val(),
				description: $('#editgear-description', view.$element).val(),
				price_a: $('#editgearpricing-form #price_a', this.$element).val(),
				price_b: $('#editgearpricing-form #price_b', this.$element).val(),
				price_c: $('#editgearpricing-form #price_c', this.$element).val(),
                currency: App.user.data.currency,
                delivery_price: '',
                delivery_distance: '',
				accessories: accessoriesArray,
				address: $('#editgearpricingloc-form #editgearpricing-address', this.$element).val(),
				postal_code: $('#editgearpricingloc-form #editgearpricing-postalcode', this.$element).val(),
				city: $('#editgearpricingloc-form #editgearpricing-city', this.$element).val(),
				region: $('#editgearpricingloc-form #editgearpricing-region', this.$element).val(),
				country: $('#editgearpricingloc-form #editgearpricing-country option:selected').val()
            };

            if ($('#editgear-subtype', view.$element).selectedIndex === 0) {
                alert('The subtype field is required.');
				view.toggleLoading();
                return;
            }
            if ($('#editgear-brand', view.$element).selectedIndex === 0) {
                alert('The brand field is required.');
				view.toggleLoading();
				return;
            }
            if ($('#editgear-model', view.$element).val() === '') {
                alert('The model field is required.');
                view.toggleLoading();
				return;
            }
            if ($('#editgearpricing-form #price_a', this.$element).val() === '') {
                alert('The rental price field is required.');
                view.toggleLoading();
				return;
            }
			if (parseFloat($('#editgearpricing-form #price_a', this.$element).val())%1!==0) {
				alert('The hourly rental price is invalid.');
				view.toggleLoading();
				return;
			}
            if ($('#editgearpricing-form #price_b', this.$element).val() === '') {
                alert('The rental price field is required.');
                view.toggleLoading();
				return;
            }
			if (parseFloat($('#editgearpricing-form #price_b', this.$element).val())%1!==0) {
				alert('The daily rental price is invalid.');
				view.toggleLoading();
				return;
			}
            if ($('#editgearpricing-form #price_c', this.$element).val() === '') {
                alert('The rental price field is required.');
                view.toggleLoading();
				return;
            }
			if (parseFloat($('#editgearpricing-form #price_c', this.$element).val())%1!==0) {
				alert('The weekly rental price is invalid.');
				view.toggleLoading();
				return;
			}
            if ($('#editgearpricingloc-form #editgearpricing-address', this.$element).val() === '') {
                alert('The address field is required.');
                view.toggleLoading();               
				return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-postalcode', this.$element).val() === '') {
                alert('The postalcode field is required.');
                view.toggleLoading();                
				return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-city', this.$element).val() === '') {
                alert('The city field is required.');
                view.toggleLoading(); 
				return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-country').selectedIndex === 0 || $('#editgearpricingloc-form #editgearpricing-country').selectedIndex === null) {
                alert('The country field is required.');
                view.toggleLoading();                 
				return;
            }
            _.extend(view.gear.data, updatedGearData);

			updateCall = function() {
                /*Localization.convertPrices([updatedGearData.price_a, updatedGearData.price_b, updatedGearData.price_c], App.user.data.currency, 'EUR', function(error, convertedPrices) {
                    if(error) {
                        console.log('Error converting prices: ' + error);
                        return;
                    }
                    view.gear.data.price_a = convertedPrices[0];
                    view.gear.data.price_b = convertedPrices[1];
                    view.gear.data.price_c = convertedPrices[2];*/
				    view.gear.save(App.user.data.id, function(error) {
                        if(error) {
                            alert('Error updating gear.');
						  console.log(error);
                            view.toggleLoading();
						  return;
					   }
					   App.router.closeModalView();
				    });
                //});
			};

			isLocationSame = (currentAddress === updatedGearData.address &&
				currentPostalCode === updatedGearData.postal_code &&
				currentCity === updatedGearData.city &&
				currentRegion === updatedGearData.region &&
				currentCountry === updatedGearData.country);

			if(isLocationSame === false) {
				addressOneliner = updatedGearData.address + ', ' + updatedGearData.postal_code + ' ' + updatedGearData.city + ', ' + updatedGearData.region + ', ' + updatedGearData.country;
				geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.gear.data.longitude = results[0].geometry.location.lng();
						view.gear.data.latitude = results[0].geometry.location.lat();
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
