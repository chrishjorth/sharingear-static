/**
 * Controller for the Sharingear Add gear dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'app', 'models/gear', 'models/localization', 'googlemaps', 'moment'],
	function(_, $, Config, ViewController, App, Gear, Localization, GoogleMaps, Moment) {
		var subtypeDefault = 'Choose subtype:',
			brandDefault = 'Choose brand:',
			countryDefault = 'Select country:',
			geocoder,

			didInitialize,
			didRender,

			getTabID,
			toggleLoading,

			addGearIcons,
			renderAccessories,
			prepopulateInstrument,
			populateSubtypeSelect,
			populateBrandSelect,
			handleGearRadio,
			handleSelectSubtype,
			handleSelectBrand,
			saveInstrument,

			populatePhotos,
			handleImageUpload,

			populateCountries,
			populatePriceSuggestions,
			handlePriceChange,
			handleDeliveryCheckbox,
			savePriceLocation,

			renderAvailability,
			renderSubmerchantForm,
			handleSubmerchantSkip,
			handleSubmerchantSubmit,
			handleSubmerchantAccept,
			handleAvailabilityNext,
			saveAvailability,

			handleCancel,
			handleNext,
			handleViewGearProfile,
			handleAddMoreGear,

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

			this.newGear = new Gear.constructor({
				rootURL: Config.API_URL
			});
			this.newGear.initialize();

			this.hasDelivery = false;

			this.shownMoment = new Moment.tz(Localization.getCurrentTimeZone());
			this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
			this.alwaysFlag = 1; //New gear is always available by default
			this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
		};

		didRender = function() {
			this.addGearIcons();
			
			this.prepopulateInstrument();
			
			this.populatePhotos();
			this.populateCountries($('#dashboard-addgearprice-country', this.$element));

			$('#dashboard-addgearprice-form #price_a', this.$element).val(this.newGear.data.price_a);
			$('#dashboard-addgearprice-form #price_b', this.$element).val(this.newGear.data.price_b);
			$('#dashboard-addgearprice-form #price_c', this.$element).val(this.newGear.data.price_c);

			this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '.next-btn', this, this.handleNext);
			this.setupEvent('change', '#addgear-form-type .gearbuttonlist-container input[type="radio"]', this, this.handleGearRadio);
			this.setupEvent('change', '#dashboard-addgearphotos-form-imageupload', this, this.handleImageUpload);

			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
		};

		getTabID = function() {
			var tabID = null;
			$('.addgear-panel').each(function() {
				var $this = $(this);
				if($this.hasClass('hidden') === false) {
					tabID = $this.attr('id');
				}
			});
			return tabID;
		};

		populatePriceSuggestions = function () {
			var gearClassification = App.gearClassification.data.classification,
                view, gearSubtypes, i, suggestionA, suggestionB, suggestionC;

            view = this;

            gearSubtypes = gearClassification[view.newGear.data.gear_type];
            for(i = 0; i < gearSubtypes.length; i++) {
                if (gearSubtypes[i].subtype === view.newGear.data.subtype) {
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
                $('#addgear-price_a-suggestion', view.$element).html(Math.ceil(convertedPrice));
            });
            Localization.convertPrice(suggestionB, App.user.data.currency, function(error, convertedPrice) {
                if(error) {
                    console.log('Could not convert price: ' + error);
                    return;
                }
                $('#addgear-price_b-suggestion', view.$element).html(Math.ceil(convertedPrice));
            });
            Localization.convertPrice(suggestionC, App.user.data.currency, function(error, convertedPrice) {
                if(error) {
                    console.log('Could not convert price: ' + error);
                    return;
                }
                $('#addgear-price_c-suggestion', view.$element).html(Math.ceil(convertedPrice));
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

		addGearIcons = function() {
			var view = this,
				gearClassification = App.gearClassification.data,
				html = '',
				gearType;

			for(gearType in gearClassification.classification) {
				html += '<div class="custom-radio">';
				html += '<input type="radio" name="gear-radio" id="gear-radio-' + gearType + '" value="' + gearType + '">';
				html += '<label for="gear-radio-' + gearType + '">';
				html += '<div class="custom-radio-icon sg-icon icon-addgear-' + gearType.toLowerCase() + '"></div>';
				html += gearType;
				html += '</label>';
				html += '</div>';
			}

			$('.gearbuttonlist-container', view.$element).append(html);
		};

		renderAccessories = function () {
			var view = this,
				gearClassification = App.gearClassification.data.classification,
				html = '',
				gearType, gearSubtypes, i, j;

			gearType = $('#addgear-form-type input[type="radio"]:checked').val();

			gearSubtypes = gearClassification[gearType];

			for(i = 0; i < gearSubtypes.length; i++) {
				if (gearSubtypes[i].subtype === $('#addgear-form-subtype', view.$element).val()) {
					for(j = 0; j < gearSubtypes[i].accessories.length; j++){
						//Check the checkbox if the specific accessory was selected for this gear before
						if(view.newGear.data.accessories !== null && view.newGear.data.accessories.indexOf(gearSubtypes[i].accessories[j]) > -1) {
							html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'" checked> '+gearSubtypes[i].accessories[j];
						}
						else {
							html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'"> '+gearSubtypes[i].accessories[j];
						}
					}
				}
			}
			$('#addgear-accessories-container', view.$element).html(html);
		};

		/**
		 * Prefills the form with passed data.
		 */
		prepopulateInstrument = function() {
			var gear;
			if(!this.passedData || this.passedData === null) {
				return;
			}
			gear = this.passedData.data;
			if(!gear) {
				return;
			}
			if(gear.gear_type && gear.gear_type.length >= 0) {
				$('#dashboard-addgear-form .gearbuttonlist-container #gear-radio-' + gear.gear_type.toLowerCase()).prop('checked', true);
				this.populateSubtypeSelect(gear.gear_type);
				if(gear.subtype && gear.subtype.length >= 0) {
					$('#gear-subtype-container select').val(gear.subtype);
					this.populateBrandSelect();
					if(gear.brand && gear.brand.length >= 0) {
						$('#gear-brand-container select').val(gear.brand);
					}
				}
			}
			$('#dashboard-addgear-form-model').val(gear.model);
			$('#dashboard-addgear-form-description').val(gear.description);
		};

		populateSubtypeSelect = function(gearType) {
			var gearClassification = App.gearClassification.data.classification,
				html = '<option> ' + subtypeDefault + ' </option>',
				$subtypeSelect, $brandSelectContainer, $detailsContainer, gearSubtypes, i;

			$('#addgear-form-subtype-container', this.$element).removeClass('hidden');

			$subtypeSelect = $('#addgear-form-subtype-container select', this.$element);
			$subtypeSelect.empty();
			
			$brandSelectContainer = $('#addgear-form-brand-container', this.$element);
			if($brandSelectContainer.hasClass('hidden') === false) {
				$brandSelectContainer.addClass('hidden');
			}

			$detailsContainer = $('#addgear-form-geardetails-container', this.$element);
			if($detailsContainer.hasClass('hidden') === false) {
				$detailsContainer.addClass('hidden');
			}
			
			gearSubtypes = gearClassification[gearType];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i].subtype + '">' + gearSubtypes[i].subtype + '</option>';
			}
			$subtypeSelect.append(html);
			this.setupEvent('change', '#addgear-form-subtype-container select', this, this.handleSelectSubtype);
		};

		populateBrandSelect = function() {
			var brands = App.gearClassification.data.brands,
				html = '<option> ' + brandDefault + ' </option>',
				$brandSelect, $detailsContainer, i;

			$('#addgear-form-brand-container', this.$element).removeClass('hidden');

			$brandSelect = $('#addgear-form-brand-container select', this.$element);
			$brandSelect.empty();

			$detailsContainer = $('#addgear-form-geardetails-container', this.$element);
			if($detailsContainer.hasClass('hidden') === false) {
				$detailsContainer.addClass('hidden');
			}

			for(i = 0; i < brands.length; i++) {
				html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
			}
			$brandSelect.append(html);
			this.setupEvent('change', '#addgear-form-brand-container select', this, this.handleSelectBrand);
		};

		/**
		 * @assertion: gearClassification has been loaded
		 */
		handleGearRadio = function(event) {
			var view = event.data;
			$('.hint1', view.$element).addClass('hidden');
			view.populateSubtypeSelect($(this).val());
		};

		handleSelectSubtype = function(event) {
			var view = event.data;
			view.populateBrandSelect();
			view.renderAccessories();
		};

		handleSelectBrand = function(event) {
			var view = event.data;
			$('#addgear-form-geardetails-container', view.$element).removeClass('hidden');
		};

		saveInstrument = function() {
			var view = this,
				accessoriesArray = [],
				newData, callback;

			if(view.isLoading === true) {
				return;
			}

			//Push the checked checkboxes to an array
			Array.prototype.push.apply(accessoriesArray, $('#addgear-accessories-container input:checked', view.$element).map(function(){
				return this.name;
			}));

			//Create new gear model object from form data
			newData = {
				gear_type: $('#addgear-form-type .gearbuttonlist-container input[type="radio"]:checked').val(),
				subtype: $('#addgear-form-subtype option:selected').val(),
				brand: $('#addgear-form-brand option:selected').val(),
				model: $('#addgear-form-model').val(),
				accessories: accessoriesArray,
				description: $('#addgear-form-description').val()
			};

			//Validate
			if(!newData.gear_type || newData.gear_type === '') {
				alert('Please select a type of instrument.');
				return;
			}
			if(newData.subtype === '' || newData.subtype === subtypeDefault) {
				alert('Please select a subtype for your instrument.');
				return;
			}
			if(newData.brand === '' || newData.brand === brandDefault) {
				alert('Please select the instrument\'s brand.');
				return;
			}
			if(newData.model === '') {
				alert('Please type in the model of your instrument.');
				return;
			}

			this.toggleLoading();

			_.extend(this.newGear.data, newData);

			callback = function(error) {
				if(error) {
					alert('Error saving gear');
					return;
				}

				view.showPanel('#addgear-panel-photos');

				view.toggleLoading();
			};

			if(this.newGear.data.id === null) {
				this.newGear.createGear(App.user, callback);
			}
			else {
				//Case of the user tabbing back
				this.newGear.save(App.user.data.id, callback);
			}

			this.populatePriceSuggestions();
		};

		populatePhotos = function() {
			var images = this.newGear.data.images.split(','),
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {
					html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
				}
			}
			$('#dashboard-addgearphotos-form .thumb-list-container ul', this.$element).append(html);
		};

		handleImageUpload = function(event) {
			var view = event.data,
				$file = $(this);

            view.toggleLoading();

            view.newGear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
				var $thumbList, html;
				if(error) {
					alert('Error uploading file.');
					console.log(error);
					view.toggleLoading();
					return;
				}

				$thumbList = $('#dashboard-addgearphotos-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);

                view.toggleLoading();
            });
		};

		populateCountries = function($select) {
            var html = $('option', $select).first()[0].outerHTML,
            	countriesArray, i;
			countriesArray = Localization.getCountries();
			for(i = 0; i < countriesArray.length; i++) {
				html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name + '</option>';
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

		handleDeliveryCheckbox = function(event) {
			var view = event.data;
            if(this.checked === true) {
            	view.hasDelivery = true;
            	$(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled');
            }
            else {
            	view.hasDelivery = false;
            	$(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
            }
        };

		savePriceLocation = function() {
			var view = this,
                isLocationSame, addressOneliner, newGearData, saveCall,
                currentAddress, currentPostalCode, currentCity, currentRegion, currentCountry, didLocationChange;

            if(view.isLoading === true) {
            	return;
            }

            currentAddress = this.newGear.address;
			currentPostalCode = this.newGear.postal_code;
			currentCity = this.newGear.city;
			currentRegion = this.newGear.region;
			currentCountry = this.newGear.country;
			didLocationChange = false;

			_.extend(this.newGear.data, {
				price_a: $('#dashboard-addgearprice-form #price_a', this.$element).val(),
				price_b: $('#dashboard-addgearprice-form #price_b', this.$element).val(),
				price_c: $('#dashboard-addgearprice-form #price_c', this.$element).val(),
                address: $('#dashboard-addgearprice-form #dashboard-addgearprice-address', this.$element).val(),
				postal_code: $('#dashboard-addgearprice-form #dashboard-addgearprice-postalcode', this.$element).val(),
				city: $('#dashboard-addgearprice-form #dashboard-addgearprice-city', this.$element).val(),
				region: $('#dashboard-addgearprice-form #dashboard-addgearprice-region', this.$element).val(),
				country: $('#dashboard-addgearprice-form #dashboard-addgearprice-country option:selected').val()
			});

			if(this.hasDelivery === true) {
				this.newGear.data.delivery_price = $('#dashboard-addgearprice-form input[name="delivery_price"]', this.$element).val();
				this.newGear.data.delivery_distance = $('#dashboard-addgearprice-form input[name="delivery_distance"]', this.$element).val();
			}

			newGearData = this.newGear.data;

			//Validation
			if(newGearData.price_a === '') {
				alert('Price is missing.');
				return;
			}
			if(newGearData.price_a % 1 !==0) {
				alert('Hourly price is invalid.');
				return;
			}
			if(newGearData.price_b === '') {
				alert('Price is missing.');
				return;
			}
			if(newGearData.price_b % 1 !==0) {
				alert('Daily is invalid.');
				return;
			}
			if(newGearData.price_c === '') {
				alert('Price is missing.');
				return;
			}
			if(newGearData.price_c % 1 !==0) {
				alert('Weekly is invalid.');
				return;
			}
			if(this.hasDelivery === true && newGearData.delivery_price === '') {
				alert('Delivery price is missing.');
				return;
			}
			if(this.hasDelivery === true && newGearData.delivery_distance === '') {
				alert('Delivery distance is missing.');
				return;
			}
			if(newGearData.address === '') {
				alert('Address is missing');
				return;
			}
			if(newGearData.postal_code === '') {
				alert('Postal code is missing.');
				return;
			}
			if(newGearData.city === '') {
				alert('City is missing.');
				return;
			}
			if(newGearData.country === '' || newGearData.country === countryDefault) {
				alert('Country is missing.');
				return;
			}

			isLocationSame = (currentAddress === newGearData.address &&
				currentPostalCode === newGearData.postal_code &&
				currentCity === newGearData.city &&
				currentRegion === newGearData.region &&
				currentCountry === newGearData.country);

			view.toggleLoading();

			saveCall = function() {
				Localization.convertPrices([newGearData.price_a, newGearData.price_b, newGearData.price_c], App.user.data.currency, 'EUR', function(error, convertedPrices) {
					if(error) {
						console.log('Error converting prices: ' + error);
						return;
					}
					view.newGear.data.price_a = convertedPrices[0];
					view.newGear.data.price_b = convertedPrices[1];
					view.newGear.data.price_c = convertedPrices[2];
					view.newGear.save(App.user.data.id, function(error) {
						if(error) {
							alert('Error saving data');
							view.toggleLoading();
							return;
						}
						view.showPanel('#addgear-panel-availability');
						if(App.user.isSubMerchant() === false) {
							view.renderSubmerchantForm();
						}
						else {
							view.renderAvailability();
						}
						view.toggleLoading();
					});
				});
			};

			if(isLocationSame === false) {
				addressOneliner = newGearData.address + ', ' + newGearData.postal_code + ' ' + newGearData.city + ', ' + newGearData.country;
				geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.newGear.data.longitude = results[0].geometry.location.lng();
						view.newGear.data.latitude = results[0].geometry.location.lat();
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
			$calendarContainer = $('#addgear-availability-calendar', this.$element);
			$calendarContainer.removeClass('hidden');
			require(['viewcontrollers/availabilitycalendar', 'text!../templates/availabilitycalendar.html'], function(calendarVC, calendarVT) {
				view.calendarVC = new calendarVC.constructor({name: 'availabilitycalendar', $element: $calendarContainer, template: calendarVT, passedData: view.newGear});
				view.calendarVC.initialize();
				view.calendarVC.render();
			});
		};

		renderSubmerchantForm = function() {
			var user = App.user.data;

			$('#addgear-availability-submerchantform', this.$element).removeClass('hidden');
			$('.sg-btn-square .next-btn', this.$element).addClass('hidden');

			if(user.birthdate && user.birthdate !== '') {
				$('#submerchantregistration-birthdate', this.$element).parent().addClass('hidden');
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

			this.setupEvent('click', '#addgear-availability .btn-skip', this, this.handleSubmerchantSkip);
			// this.setupEvent('submit', '#addgear-submerchantform', this, this.handleSubmerchantSubmit);
			this.setupEvent('click', '.sg-btn-square .next-btn', this, this.handleSubmerchantSubmit);
			this.setupEvent('click', '#submerchantregistration-accept', this, this.handleSubmerchantAccept);
		};

		handleSubmerchantSkip = function(event) {
			var view = event.data;
			App.router.navigateTo('dashboard/addgearend', view.newGear);
		};

		handleSubmerchantSubmit = function(event) {
			var view = event.data,
				user = App.user.data,
				tempUser = {},
				addressOneliner, $select, content, iban, swift, ibanRegEx, swiftRegEx;

			_.extend(tempUser, user);

			if(user.birthdate === null) {
				tempUser.birthdate = $('#submerchantregistration-birthdate', view.$element).val();
				if(tempUser.birthdate !== '') {
					tempUser.birthdate = (new Moment.tz(tempUser.birthdate, 'DD/MM/YYYY', Localization.getCurrentTimeZone())).format('YYYY-MM-DD');
				}
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
                    $('#addgear-availability-submerchantform', view.$element).addClass('hidden');
					$('#addgear-availability-terms', view.$element).removeClass('hidden');
                }
                else {
                    alert('The address is not valid!');
                }
            });
		};

		handleSubmerchantAccept = function(event) {
			var view = event.data,
                currentBtn = $(this);

            view.isLoading = true;

            currentBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin"></i>');
			App.user.update(function(error) {
				if(error) {
					console.log(error);
					alert('Error saving user data.');
					view.isLoading = false;
					return;
				}
				App.user.updateBankDetails(function(error) {
					view.isLoading = false;
					if(error) {
						console.log(error);
						alert('Error registering bank data.');
						return;
					}
					$('#addgear-availability-terms', view.$element).addClass('hidden');
					$('#addgear-availability-calendar', view.$element).removeClass('hidden');
					$('#editgear-next-btn', view.$element).removeClass('hidden');
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

      		view.newGear.setAvailability(App.user.data.id, availabilityArray, alwaysFlag, function(error) {
      			if(error) {
      				alert('Error saving gear availability.');
      				console.log(error);
      				return;
      			}
      			view.toggleLoading();
      			$('.footer', view.$element).addClass('hidden');
      			view.showPanel('#addgear-panel-final');
      			view.setupEvent('click', '.profile-btn', view, view.handleViewGearProfile);
      			view.setupEvent('click', '.addmore-btn', view, view.handleAddMoreGear);
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
				case 'addgear-panel-type':
					view.saveInstrument();
					break;
				case 'addgear-panel-photos':
					if(view.isLoading === false) {
						view.showPanel('#addgear-panel-pricelocation');
					}
					break;
				case 'addgear-panel-pricelocation':
					view.savePriceLocation();
					break;
				case 'addgear-panel-availability':
					view.saveAvailability();
					break;
				default:
					console.log('Something went wrong.');
			}
		};

		handleViewGearProfile = function(event) {
			var view = event.data;
			App.router.closeModalView();
			App.router.navigateTo('gearprofile/' + view.newGear.data.id);
		};

		handleAddMoreGear = function() {
			App.router.closeModalView();
			App.router.openModalView('addgear');
		};

		showPanel = function(panelID) {
			$('.addgear-panel', this.$element).each(function() {
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

			addGearIcons: addGearIcons,
			renderAccessories: renderAccessories,
			prepopulateInstrument: prepopulateInstrument,
			populateSubtypeSelect: populateSubtypeSelect,
			populateBrandSelect: populateBrandSelect,
			handleGearRadio: handleGearRadio,
			handleSelectSubtype: handleSelectSubtype,
			handleSelectBrand: handleSelectBrand,
			saveInstrument: saveInstrument,

			populatePhotos: populatePhotos,
			handleImageUpload: handleImageUpload,

			populatePriceSuggestions:populatePriceSuggestions,

			populateCountries: populateCountries,
			handlePriceChange: handlePriceChange,
			handleDeliveryCheckbox: handleDeliveryCheckbox,
			savePriceLocation: savePriceLocation,

			renderAvailability: renderAvailability,
			renderSubmerchantForm: renderSubmerchantForm,
			handleSubmerchantSkip: handleSubmerchantSkip,
			handleSubmerchantSubmit: handleSubmerchantSubmit,
			handleSubmerchantAccept: handleSubmerchantAccept,
			handleAvailabilityNext: handleAvailabilityNext,
			saveAvailability: saveAvailability,
			
			handleCancel: handleCancel,
			handleNext: handleNext,
			handleViewGearProfile: handleViewGearProfile,
			handleAddMoreGear: handleAddMoreGear,

			showPanel: showPanel
		});
	}
);