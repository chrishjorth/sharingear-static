/**
 * Controller for the Sharingear Add gear dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gear', 'googlemaps', 'moment'],
	function(_, $, ViewController, App, Gear, GoogleMaps, Moment) {
		var subtypeDefault = 'Choose subtype:',
			brandDefault = 'Choose brand:',
			countryDefault = 'Select country:',
			geocoder,

			didInitialize,
			didRender,

			getTabID,
			toggleLoading,

			addGearIcons,
			prepopulateInstrument,
			populateSubtypeSelect,
			populateBrandSelect,
			handleGearRadio,
			handleSelectSubtype,
			saveInstrument,

			populatePhotos,
			handleImageUpload,

			populateAccessories,

			populateCountries,
			handlePriceChange,
			handleDeliveryCheckbox,
			savePriceLocation,

			renderAvailability,
			renderSubmerchantForm,
			handleSubmerchantSkip,
			handleSubmerchantSubmit,
			handleSubmerchantAccept,
			renderMonthCalendar,
			setupMonthCalendar,
			clearSelections,
			renderSelections,
			handleToday,
			handlePrevious,
			handleAvailabilityNext,
			handleClearMonth,
			handleAlwaysAvailable,
			handleNeverAvailable,
			handleDayStartSelect,
			handleDayMoveSelect,
			handleDayEndSelect,
			isBeforeOrSameDay,
			saveAvailability,
			isAfterOrSameDay,

			handleNext;

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

			this.newGear = new Gear.constructor({
				rootURL: App.API_URL
			});

			this.hasDelivery = false;

			this.shownMoment = new Moment();
			this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
			this.alwaysFlag = 1; //New gear is always available by default
			this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false

			$('#gearavailability-always-btn', this.$element).removeClass('disabled');
			$('#gearavailability-never-btn', this.$element).removeClass('disabled');
		};

		didRender = function() {
			this.addGearIcons();
			this.prepopulateInstrument();
			this.populatePhotos();
			this.populateCountries($('#dashboard-addgearprice-country', this.$element));

			$('#dashboard-addgearprice-form #price_a', this.$element).val(this.newGear.data.price_a);
			$('#dashboard-addgearprice-form #price_b', this.$element).val(this.newGear.data.price_b);
			$('#dashboard-addgearprice-form #price_c', this.$element).val(this.newGear.data.price_c);


			this.setupEvent('click', '#editgear-next-btn', this, this.handleNext);
			this.setupEvent('change', '#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]', this, this.handleGearRadio);
			this.setupEvent('change', '#dashboard-addgearphotos-form-imageupload', this, this.handleImageUpload);
			this.setupEvent('change', '#dashboard-addgear-form-subtype', this, this.populateAccessories);

			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
		};

		getTabID = function() {
			return $('#addgear-crumbs li.active', this.$element).attr('id');
		};

		toggleLoading = function() {
			if(this.isLoading === true) {
				$('#editgear-next-btn', this.$element).html('Next');
				this.isLoading = false;
			}
			else {
				$('#editgear-next-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
				this.isLoading = true;
			}
		};

		populateAccessories = function (event) {
			var gearClassification = App.gearClassification.data.classification,
				html = "",
				view,gearSubtypes,i;

			view = event.data;
			var geartype = $('#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]:checked',view.$element).val();

			gearSubtypes = gearClassification[geartype];
			for(i = 0; i < gearSubtypes.length; i++) {
				if (gearSubtypes[i].subtype === $('#dashboard-addgear-form-subtype',view.$element).val()) {
					var j;
					for(j=0;j<gearSubtypes[i].accessories.length;j++){
						html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'"> '+gearSubtypes[i].accessories[j];
					}
				}
			}
			$('#dashboard-addgear-accessories-container',view.$element).html(html);
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
				html += '<img src="images/addgear/' + gearType.toLowerCase() + '-48x48.png" width="48" height"48" class="custom-radio-image">';
				html += gearType;
				html += '</label>';
				html += '</div>';
			}

			$('.gearbuttonlist-container', view.$element).append(html);
		};

		/**
		 * Prefills the form with passed data.
		 */
		prepopulateInstrument = function() {
			var gear;
			if(this.passedData === null || !(this.passedData)) { // added !(this.passedData) because it was undefined. Horatiu
				return;
			}
			gear = this.passedData.data;
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
				$subtypeSelect, $brandSelectContainer, gearSubtypes, i;

			$('#gear-subtype-container', this.$element).removeClass('hidden');

			$subtypeSelect = $('#gear-subtype-container select', this.$element);
			$subtypeSelect.empty();
			
			$brandSelectContainer = $('#gear-brand-container', this.$element);
			if($brandSelectContainer.hasClass('hidden') === false) {
				$brandSelectContainer.addClass('hidden');
			}
			
			gearSubtypes = gearClassification[gearType];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i].subtype + '">' + gearSubtypes[i].subtype + '</option>';
			}
			$subtypeSelect.append(html);
			this.setupEvent('change', '#gear-subtype-container select', this, this.handleSelectSubtype);
		};

		populateBrandSelect = function() {
			var brands = App.gearClassification.data.brands,
				html = '<option> ' + brandDefault + ' </option>',
				$brandSelect, i;

			$('#gear-brand-container', this.$element).removeClass('hidden');

			$brandSelect = $('#gear-brand-container select', this.$element);
			$brandSelect.empty();

			for(i = 0; i < brands.length; i++) {
				html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
			}
			$brandSelect.append(html);
		};

		/**
		 * @assertion: gearClassification has been loaded
		 */
		handleGearRadio = function(event) {
			var view = event.data;
			view.populateSubtypeSelect($(this).val());
		};

		handleSelectSubtype = function(event) {
			var view = event.data;
			view.populateBrandSelect();
		};

		saveInstrument = function() {
			var view = this,
				newData, callback;

			if(view.isLoading === true) {
				return;
			}

			//Create new gear model object from form data
			newData = {
				gear_type: $('#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]:checked').val(),
				subtype: $('#dashboard-addgear-form-subtype option:selected').val(),
				brand: $('#dashboard-addgear-form-brand option:selected').val(),
				model: $('#dashboard-addgear-form-model').val(),
				description: $('#dashboard-addgear-form-description').val()
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

				$('#addgear-photos-li', view.$element).html('<a href="#addgear-photos" role="tab" data-toggle="tab">Photos</a>');
				$('#addgear-crumbs a[href="#addgear-photos"]', view.$element).tab('show');
				view.toggleLoading();
			};

			if(this.newGear.data.id === null) {
				this.newGear.createGear(App.user, callback);
			}
			else {
				//Case of the user tabbing back
				this.newGear.save(App.user.data.id, callback);
			}
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
            var countriesArray = App.localization.getCountries(),
				html = $('option', $select).first()[0].outerHTML,
				i;
			for(i = 0; i < countriesArray.length; i++) {
				html += '<option value="' + countriesArray[i].alpha2 + '">' + countriesArray[i].name + '</option>';
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
			if(newGearData.price_a%1!==0) {
				alert('Hourly price is invalid.');
				return;
			}
			if(newGearData.price_b === '') {
				alert('Price is missing.');
				return;
			}
			if(newGearData.price_b%1!==0) {
				alert('Daily is invalid.');
				return;
			}
			if(newGearData.price_c === '') {
				alert('Price is missing.');
				return;
			}
			if(newGearData.price_c%1!==0) {
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
				view.newGear.save(App.user.data.id, function(error) {
					if(error) {
						alert('Error saving data');
						view.toggleLoading();
						return;
					}
					$('#addgear-availability-li', view.$element).html('<a href="#addgear-availability" role="tab" data-toggle="tab">Availability</a>');
					$('#addgear-crumbs a[href="#addgear-availability"]', view.$element).tab('show');
					if(App.user.isSubMerchant() === false) {
						view.renderSubmerchantForm();
					}
					else {
						view.renderAvailability();
					}
					view.toggleLoading();
				});
			};

			if(isLocationSame === false) {
				addressOneliner = newGearData.address + ', ' + newGearData.postal_code + ' ' + newGearData.city + ', ' + newGearData.region + ', ' + newGearData.country;
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
			$('#addgear-availability-calendar', this.$element).removeClass('hidden');

			this.renderMonthCalendar($('#gearavailability-months-container'));
			this.setupMonthCalendar();
			this.clearSelections();
			this.renderSelections();

			this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
			this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#gearavailability-next-btn', this, this.handleAvailabilityNext);

			this.setupEvent('click', '#gearavailability-clearmonth-btn', this, this.handleClearMonth);
			this.setupEvent('click', '#gearavailability-always-btn', this, this.handleAlwaysAvailable);
			this.setupEvent('click', '#gearavailability-never-btn', this, this.handleNeverAvailable);
			this.setupEvent('mousedown touchstart', '#gearavailability-months-container .day-row .day', this, this.handleDayStartSelect);
		};

		renderSubmerchantForm = function() {
			var user = App.user.data;

			$('#addgear-availability-submerchantform', this.$element).removeClass('hidden');
			$('#editgear-next-btn', this.$element).addClass('hidden');

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
			this.setupEvent('submit', '#addgear-submerchantform', this, this.handleSubmerchantSubmit);
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
					tempUser.birthdate = (new Moment(tempUser.birthdate, 'DD/MM/YYYY')).format('YYYY-MM-DD');
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

            addressOneliner = tempUser.address + ', ' + tempUser.postal_code + ' ' + tempUser.city + ', ' + tempUser.region + ', ' + tempUser.country;
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

		renderMonthCalendar = function($monthCalendarContainer) {
			var header, dayRows, i;
			header = '<div class="row calendar-header">';
			header += '<div class="col-md-1 col-md-offset-1"></div>';
			header += '<div class="col-md-1">M</div>';
			header += '<div class="col-md-1">T</div>';
			header += '<div class="col-md-1">W</div>';
			header += '<div class="col-md-1">T</div>';
			header += '<div class="col-md-1">F</div>';
			header += '<div class="col-md-1">S</div>';
			header += '<div class="col-md-1">S</div>';
			header += '</div>';
			dayRows = '';
			for(i = 0; i < 6; i++) {
				dayRows += '<div class="row day-row">';
				dayRows += '<div class="col-md-1 col-md-offset-1"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '</div>';
			}
			$monthCalendarContainer.append(header + dayRows);
		};

		setupMonthCalendar = function() {
			var moment, startDay, $calendarContainer, $dayBox, row, col, date;

			moment = new Moment({year: this.shownMoment.year(), month: this.shownMoment.month(), date: this.shownMoment.date()});
			startDay = moment.date(1).weekday();
			$calendarContainer = $('#gearavailability-months-container', this.$element);

			//Set date to first box
			moment.subtract(startDay, 'days');
			for(row = 1; row <= 6; row++) { //6 possible week pieces
				for(col = 1; col <= 7; col++) { //7 days
					$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
					date = moment.date();
					$dayBox.html(date);
					$dayBox.data('date', date);
					$dayBox.data('month', moment.month());
					$dayBox.attr('id', 'gearavailability-day-' + moment.month() + '-' + date);
					$dayBox.removeClass('disabled');
					if(moment.month() !== this.shownMoment.month()) {
						$dayBox.addClass('disabled');
					}
					moment.add(1, 'days');
				}
			}

			$('#gearavailability-monthtitle').html(this.shownMoment.format('MMMM YYYY'));
		};

		clearSelections = function() {
			$('#gearavailability-months-container .day-row .day').each(function() {
				$(this).removeClass('selected');
			});
		};

		renderSelections = function() {
			var selections = this.selections[this.shownMoment.year() + '-' + (this.shownMoment.month() + 1)],
				$calendarContainer = $('#gearavailability-months-container', this.$element),
				i, startMoment, endMoment, momentIterator;

			if(this.alwaysFlag === 1) { //We do not need the case of 0 since by assertion the cells have been cleared
                $('.day', $calendarContainer).each(function() {
                    var $this = $(this);
                    if($this.hasClass('disabled') === false) {
                        $this.addClass('selected');
                    }
                });
            }

            if(Array.isArray(selections) === false) {
                return;
            }

			for(i = 0; i < selections.length; i++) {
				startMoment = selections[i].startMoment;
				$('#gearavailability-day-' + startMoment.month() + '-' + startMoment.date(), $calendarContainer).addClass('selected');
				endMoment = selections[i].endMoment;
				momentIterator = new Moment({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()});
				while(momentIterator.isBefore(endMoment, 'day') === true) {
					if(this.alwaysFlag === 0) {
                        $('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');    
                    }
                    else {
                        $('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).removeClass('selected');
                    }
					momentIterator.add(1, 'days');
				}
				if(this.alwaysFlag === 0) {
					$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');    
                }
                else {
                    $('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).removeClass('selected');
                }
			}
		};

		handleToday = function(event) {
			var view = event.data;
			view.shownMoment = new Moment();
			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();
		};

		handlePrevious = function(event) {
			var view = event.data;
			view.shownMoment.subtract(1, 'month');
			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();
		};

		handleAvailabilityNext = function(event) {
			var view = event.data;
			view.shownMoment.add(1, 'month');
			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();
		};

		handleClearMonth = function(event) {
			var view = event.data;
			if(view.alwaysFlag === 1) {
                view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [{
                    startMoment: new Moment({year: view.shownMoment.year(), month: view.shownMoment.month(), day: 1}),
                    endMoment: new Moment({year: view.shownMoment.year(), month: view.shownMoment.month(), day: view.shownMoment.daysInMonth()})
                }];
            }
            else {
                view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];
            }
			view.clearSelections();
			view.renderSelections();
		};

		handleAlwaysAvailable = function(event) {
			var view = event.data;
			view.alwaysFlag = 1;
			view.selections = {};


			$('#gearavailability-always-btn',view.$element).addClass('button-selected-state');
			$('#gearavailability-never-btn',view.$element).removeClass('button-selected-state');
			view.clearSelections();
			view.renderSelections();
		};

		handleNeverAvailable = function(event) {
			var view = event.data;

			view.alwaysFlag = 0;

			view.selections = {};
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];

			$('#gearavailability-never-btn',view.$element).addClass('button-selected-state');
			$('#gearavailability-always-btn',view.$element).removeClass('button-selected-state');

			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();

		};

		handleDayStartSelect = function(event) {
			var view = event.data,
				$this = $(this),
				selection;

			//Do not allow selecting outside of the month
			if($this.data('month') !== view.shownMoment.month()) {
				return;
			}

			if($this.hasClass('selected') === true) {
                $this.removeClass('selected');
                view.dragMakeAvailable = false;
            }
            else {
                $this.addClass('selected');
                view.dragMakeAvailable = true;
            }

			$('#gearavailability-never-btn',view.$element).removeClass('button-selected-state');
			$('#gearavailability-always-btn',view.$element).removeClass('button-selected-state');

			$('body').on('mousemove touchmove', null, view, view.handleDayMoveSelect);
			$('body').on('mouseup touchend', null, view, view.handleDayEndSelect);
		};

		handleDayMoveSelect = function(event) {
			//Check if mouse is over a box, if yes add selected between start selection and current, remove rest on current table, besides those that are after another start
			var view = event.data,
				$calendarContainer, selectionX, selectionY;
			if(event.type === 'mousemove') {
				selectionX = event.pageX;
				selectionY = event.pageY;
			}
			else if(event.originalEvent.touches && event.originalEvent.touches.length == 1) {
				selectionX = event.originalEvent.targetTouches[0].pageX;
				selectionY = event.originalEvent.targetTouches[0].pageY;
			}
			else {
				//Something wrong happened and we ignore
				return;
			}

			$calendarContainer = $('#gearavailability-months-container', view.$element);
			$('.day-row .day', $calendarContainer).each(function() {
				var $this = $(this),
					dayBoxOffset, selection;

				dayBoxOffset = $this.offset();
				if($this.data('month') === view.shownMoment.month()) {
					if(selectionX >= dayBoxOffset.left && selectionX <= dayBoxOffset.left + $this.width() && selectionY >= dayBoxOffset.top && selectionY <= dayBoxOffset.top + $this.height()) {
						if(view.dragMakeAvailable === false) {
                            $this.removeClass('selected');
                        }
                        else {
                            if($this.hasClass('selected') === false) {
                                $this.addClass('selected');
                            }
                        }
					}
				}
			});
		};

		handleDayEndSelect = function(event) {
			var view = event.data,
				key, monthSelections, i, j, currentSelection, didSplice, startMomentA, endMomentA, startMomentB, endMomentB;
			$('body').off('mousemove touchmove', view.handleDayMoveSelect);
			$('body').off('mouseup touchend', view.handleDayEndSelect);

			//Add days to selections
            key = view.shownMoment.year() + '-' + (view.shownMoment.month() + 1);
            view.selections[key] = [];
            $('#gearavailability-months-container .day-row .day', view.$element).each(function() {
                var $this = $(this),
                    addSelection;
                addSelection = function() {
                    var selection;
                    selection = {
                        startMoment: new Moment({year: $this.data('year'), month: $this.data('month'), day: $this.data('date')}),
                        endMoment: new Moment({year: $this.data('year'), month: $this.data('month'), day: $this.data('date')})
                    };
                    view.selections[key].push(selection);
                };

                if($this.hasClass('disabled') === false) {
                    if(view.alwaysFlag === 1) {
                        if($this.hasClass('selected') === false) {
                            addSelection();
                        }
                    }
                    else {
                        if($this.hasClass('selected') === true) {
                            addSelection();
                        }
                    }
                }
            });

			//Scan selections for this month and cleanup overlaps
			monthSelections = view.selections[key];
			i = 0;
			while(i < monthSelections.length) {
				currentSelection = monthSelections[i];
				j = i + 1;
				didSplice = false;
				while(j < monthSelections.length) {
					startMomentA = currentSelection.startMoment;
					endMomentA = currentSelection.endMoment;
					startMomentB = monthSelections[j].startMoment;
					endMomentB = monthSelections[j].endMoment;
					if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(startMomentA, endMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
						currentSelection.startMoment = startMomentB;
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
						currentSelection.endMoment = endMomentB;
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
						currentSelection.startMoment = startMomentB;
						currentSelection.endMoment = endMomentB;
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else {
						j++;
					}
				}
				if(didSplice === false) {
					i++;
				}
			}

			view.clearSelections();
            view.renderSelections();
		};

		isBeforeOrSameDay = function(momentA, momentB) {
			return momentA.isBefore(momentB, 'day') || momentA.isSame(momentB, 'day');
		};

		isAfterOrSameDay = function(momentA, momentB) {
			return momentA.isAfter(momentB, 'day') || momentA.isSame(momentB, 'day');
		};

		/**
		 * @assertion: selections are not overlapping.
		 */
		saveAvailability = function() {
			var view = this,
				availabilityArray = [],
				month, monthSelections, selection, j;

			if(view.isLoading === true) {
				return;
			}

			view.toggleLoading();

			for(month in view.selections) {
				monthSelections = view.selections[month];
				for(j = 0; j < monthSelections.length; j++) {
					selection = monthSelections[j];
					availabilityArray.push({
						start_time: selection.startMoment.format('YYYY-MM-DD') + ' 00:00:00',
						end_time: selection.endMoment.format('YYYY-MM-DD') + ' 23:59:59'
					});
				}
			}

      		view.newGear.setAvailability(App.user.data.id, availabilityArray, view.alwaysFlag, function(error) {
      			if(error) {
      				console.log(error);
      				view.toggleLoading();
      				return;
      			}
      			App.router.navigateTo('dashboard/addgearend', view.newGear);
      		});
        };

		handleNext = function(event) {
			var view = event.data;

			switch(view.getTabID()) {
				case 'addgear-instrument-li':
					view.saveInstrument();
					break;
				case 'addgear-photos-li':
					if(view.isLoading === false) {
						$('#addgear-pricelocation-li', view.$element).html('<a href="#addgear-pricelocation" role="tab" data-toggle="tab">Price &amp; Location</a>');
						$('#addgear-crumbs a[href="#addgear-pricelocation"]', view.$element).tab('show');
					}
					break;
				case 'addgear-pricelocation-li':
					view.savePriceLocation();
					break;
				case 'addgear-availability-li':
					view.saveAvailability();
					break;
			}
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			getTabID: getTabID,
			toggleLoading: toggleLoading,

			addGearIcons: addGearIcons,
			prepopulateInstrument: prepopulateInstrument,
			populateSubtypeSelect: populateSubtypeSelect,
			populateBrandSelect: populateBrandSelect,
			handleGearRadio: handleGearRadio,
			handleSelectSubtype: handleSelectSubtype,
			saveInstrument: saveInstrument,

			populatePhotos: populatePhotos,
			handleImageUpload: handleImageUpload,

			populateAccessories:populateAccessories,

			populateCountries: populateCountries,
			handlePriceChange: handlePriceChange,
			handleDeliveryCheckbox: handleDeliveryCheckbox,
			savePriceLocation: savePriceLocation,

			renderAvailability: renderAvailability,
			renderSubmerchantForm: renderSubmerchantForm,
			handleSubmerchantSkip: handleSubmerchantSkip,
			handleSubmerchantSubmit: handleSubmerchantSubmit,
			handleSubmerchantAccept: handleSubmerchantAccept,
			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,
			clearSelections: clearSelections,
			renderSelections: renderSelections,
			handleToday: handleToday,
			handlePrevious: handlePrevious,
			handleAvailabilityNext: handleAvailabilityNext,
			handleClearMonth: handleClearMonth,
			handleAlwaysAvailable: handleAlwaysAvailable,
			handleNeverAvailable: handleNeverAvailable,
			handleDayStartSelect: handleDayStartSelect,
			handleDayMoveSelect: handleDayMoveSelect,
			handleDayEndSelect: handleDayEndSelect,
			isBeforeOrSameDay: isBeforeOrSameDay,
			isAfterOrSameDay: isAfterOrSameDay,
			saveAvailability: saveAvailability,
			
			handleNext: handleNext
		});
	}
);