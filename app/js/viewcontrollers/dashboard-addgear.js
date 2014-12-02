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

			populateCountries,
			handlePriceChange,
			handleDeliveryCheckbox,
			savePriceLocation,

			renderMonthCalendar,
			setupMonthCalendar,
			clearSelections,
			renderSelections,
			addCellsToSelections,
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
				rootURL: App.API_URL,
			});

			this.hasDelivery = false;

			this.shownMoment = new Moment();
			this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
			this.alwaysFlag = 0;

			$('#gearavailability-always-btn', this.$element).removeClass('disabled');
			$('#gearavailability-never-btn', this.$element).removeClass('disabled');
		};

		didRender = function() {
			this.addGearIcons();
			this.prepopulateInstrument();
			this.populatePhotos();
			this.populateCountries();

			$('#dashboard-addgearprice-form #price_a', this.$element).val(this.newGear.data.price_a);
			$('#dashboard-addgearprice-form #price_b', this.$element).val(this.newGear.data.price_b);
			$('#dashboard-addgearprice-form #price_c', this.$element).val(this.newGear.data.price_c);



            this.renderMonthCalendar($('#gearavailability-months-container'));
			this.setupMonthCalendar();
			this.clearSelections();
			this.renderSelections();

			this.setupEvent('click', '#editgear-next-btn', this, this.handleNext);
			this.setupEvent('change', '#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]', this, this.handleGearRadio);
			this.setupEvent('change', '#dashboard-addgearphotos-form-imageupload', this, this.handleImageUpload);

			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);

			this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
			this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#gearavailability-next-btn', this, this.handleAvailabilityNext);

			this.setupEvent('click', '#gearavailability-clearmonth-btn', this, this.handleClearMonth);
			this.setupEvent('click', '#gearavailability-always-btn', this, this.handleAlwaysAvailable);
			this.setupEvent('click', '#gearavailability-never-btn', this, this.handleNeverAvailable);
			this.setupEvent('mousedown touchstart', '#gearavailability-months-container .day-row .day', this, this.handleDayStartSelect);
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
			if(gear.type && gear.type.length >= 0) {
				$('#dashboard-addgear-form .gearbuttonlist-container #gear-radio-' + gear.type.toLowerCase()).prop('checked', true);
				this.populateSubtypeSelect(gear.type);
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
				html += '<option value="' + gearSubtypes[i] + '">' + gearSubtypes[i] + '</option>';
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

			//Create new gear model object from form data
			newData = {
				type: $('#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]:checked').val(),
				subtype: $('#dashboard-addgear-form-subtype option:selected').val(),
				brand: $('#dashboard-addgear-form-brand option:selected').val(),
				model: $('#dashboard-addgear-form-model').val(),
				description: $('#dashboard-addgear-form-description').val()
			};

			//Validate
			if(!newData.type || newData.type === '') {
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

		populateCountries = function() {
			var countriesArray = App.localization.getCountries(),
                html, i;

            html = '<option selected="selected" value="">' + countryDefault + '</option>';
			for(i = 0; i < countriesArray.length; i++) {
                html += '<option value="' + countriesArray[i].alpha2 + '">' + countriesArray[i].name + '</option>';
            }
            $('#dashboard-addgearprice-country', this.$element).append(html);
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
			if(newGearData.price_b === '') {
				alert('Price is missing.');
				return;
			}
			if(newGearData.price_c === '') {
				alert('Price is missing.');
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

			if(this.alwaysFlag === 1) {
				$('.day', $calendarContainer).each(function() {
					var $this = $(this);
					if($this.hasClass('disabled') === false) {
						$this.addClass('selected');
					}
				});
				return;
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
					$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
					momentIterator.add(1, 'days');
				}
				$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
			}
		};

		addCellsToSelections = function() {
			var view = this,
				moment, currentMoment, inInterval, selection, start, end;

			moment = new Moment(view.shownMoment);
			moment.date(1);
			currentMoment = new Moment(moment);
			currentMoment.date(1);

			inInterval = false;

			//Remove current selection
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];

			$('#gearavailability-months-container .day-row .day').each(function() {
				//TODO: This is an ugly if construction, invert it
				if($(this).hasClass('disabled') && inInterval === false) {
					// console.log('do nothing');
				}
				else if($(this).hasClass('selected')) {
					//if not in an active interval initiate one
					if (inInterval === false) {
						inInterval = !inInterval;
						start = new Moment(currentMoment);
					}
					currentMoment.add(1, 'days');
				}
				else {
					if(inInterval === true) {
						inInterval = !inInterval;
						end = new Moment(currentMoment);
						end.subtract(1, 'days');
						selection = {
							startMoment: start,
							endMoment: end
						};
						view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)].push(selection);
					}
					currentMoment.add(1, 'days');
				}
			});
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
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];
			view.clearSelections();
			view.renderSelections();
		};

		handleAlwaysAvailable = function(event) {
			var view = event.data;
			view.alwaysFlag = 1;
			view.selections = {};

			view.clearSelections();
			view.renderSelections();
		};

		handleNeverAvailable = function(event) {
			var view = event.data;

			view.alwaysFlag = 0;

			view.selections = {};
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];

			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();
		};

		handleDayStartSelect = function(event) {
			var view = event.data,
				$this = $(this),
				selection;

			//If the day is already selected
			if($this.hasClass('selected') === true) {
                $this.removeClass('selected');
                view.addCellsToSelections();
				return;
			}

			//Do not allow selecting outside of the month
			if($this.data('month') !== view.shownMoment.month()) {
				return;
			}
			$('body').on('mousemove touchmove', null, view, view.handleDayMoveSelect);
			$('body').on('mouseup touchend', null, view, view.handleDayEndSelect);

			selection = {
				startMoment: new Moment({year: view.shownMoment.year(), month: $this.data('month'), day: $this.data('date')}),
				endMoment: new Moment({year: view.shownMoment.year(), month: $this.data('month'), day: $this.data('date')})
			};

			if(Array.isArray(view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)]) === false) {
				view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];
			}
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)].push(selection);

			view.clearSelections();
			view.renderSelections();
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
						selection = view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)];
						selection = selection[selection.length - 1];
						selection.endMoment.month($this.data('month'));
						selection.endMoment.date($this.data('date'));
					}
				}
			});

			view.clearSelections();
			view.renderSelections();
		};

		handleDayEndSelect = function(event) {
			var view = event.data,
				monthSelections, i, j, currentSelection, didSplice, startMomentA, endMomentA, startMomentB, endMomentB;
			$('body').off('mousemove touchmove', view.handleDayMoveSelect);
			$('body').off('mouseup touchend', view.handleDayEndSelect);

			//Scan selections for this month and cleanup overlaps
			monthSelections = view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)];
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

			view.toggleLoading();

			view.addCellsToSelections();

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
					$('#addgear-pricelocation-li', view.$element).html('<a href="#addgear-pricelocation" role="tab" data-toggle="tab">Price &amp; Location</a>');
					$('#addgear-crumbs a[href="#addgear-pricelocation"]', view.$element).tab('show');
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

			populateCountries: populateCountries,
			handlePriceChange: handlePriceChange,
			handleDeliveryCheckbox: handleDeliveryCheckbox,
			savePriceLocation: savePriceLocation,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,
			clearSelections: clearSelections,
			renderSelections: renderSelections,
			addCellsToSelections: addCellsToSelections,
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