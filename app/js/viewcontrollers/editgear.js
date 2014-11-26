/**
 * Controller for the Sharingear Edit gear page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gear', 'googlemaps','utilities', 'moment'],
	function(_, $, ViewController, App, Gear, GoogleMaps, Utilities, Moment) {
		var geocoder,

            didInitialize,
            didRender,

            populateBrandSelect,
            populateSubtypeSelect,

            populateImages,
            handleImageUpload,

            populateLocation,
            populateCountry,
            populateDelivery,
            handleDeliveryCheckbox,

            initAvailability,
            renderAvailability,
            renderMonthCalendar,
            setupMonthCalendar,
            clearSelections,
            renderSelections,
            addCellsToSelections,
            handleToday,
            handlePrevious,
            handleNextButton,
            handleClearMonth,
            handleAlwaysAvailable,
            handleNeverAvailable,
            handleDayStartSelect,
            handleDayMoveSelect,
            handleDayEndSelect,

            handleCancel,
            handleSave,

            isBeforeOrSameDay,
            isAfterOrSameDay;

        geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			this.gear = this.passedData;
			this.templateParameters = this.gear.data;
            this.initAvailability();
		};

		didRender = function() {
			this.populateBrandSelect();
			this.populateSubtypeSelect();

			this.populateImages();

            this.populateCountry();
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

            this.setupEvent('click', '.btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '.btn-save', this, this.handleSave);
            this.setupEvent('change', '#editgear-photos-form-imageupload', this, this.handleImageUpload);
            this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);

            this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
            this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
            this.setupEvent('click', '#gearavailability-next-btn', this, this.handleNextButton);
            this.setupEvent('click', '#gearavailability-clearmonth-btn', this, this.handleClearMonth);
            this.setupEvent('click', '#gearavailability-always-btn', this, this.handleAlwaysAvailable);
            this.setupEvent('click', '#gearavailability-never-btn', this, this.handleNeverAvailable);
            this.setupEvent('mousedown touchstart', '#gearavailability-months-container .day-row .day', this, this.handleDayStartSelect);
        };

        populateDelivery = function(){
            var price = this.gear.data.delivery_price ? this.gear.data.delivery_price : '',
                distance = this.gear.data.delivery_distance ? this.gear.data.delivery_distance : '';

            $('#editgearpricingloc-form #delivery_price').val(price);
            $('#editgearpricingloc-form #delivery_distance').val(distance);
        };

        renderAvailability = function() {
            this.renderMonthCalendar($('#gearavailability-months-container'));
            this.setupMonthCalendar();
            this.clearSelections();
            this.renderSelections();
        };

        initAvailability = function() {
            var view = this;

            Moment.locale('en-custom', {
                week: {
                    dow: 1,
                    doy: 4
                }
            });
            this.shownMoment = new Moment();

            this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
            this.alwaysFlag = -1;

            this.gear.getAvailability(App.user.data.id, function(error, result) {
                var i, startMoment, endMoment;
                var availabilityArray = result.availabilityArray;
                view.alwaysFlag = result.alwaysFlag; // here the flag is set from the DB !!!!

                $('#gearavailability-always-btn').removeClass('disabled');
                $('#gearavailability-never-btn').removeClass('disabled');

                if(error) {
                    return;
                }
                for(i = 0; i < availabilityArray.length; i++) {
                    startMoment = new Moment(availabilityArray[i].start);
                    endMoment = new Moment(availabilityArray[i].end);
                    if(Array.isArray(view.selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
                        view.selections[startMoment.year() + '-' + (startMoment.month() + 1)] = [];
                    }
                    view.selections[startMoment.year() + '-' + (startMoment.month() + 1)].push({
                        startMoment: startMoment,
                        endMoment: endMoment
                    });
                }
                view.renderSelections();
            });
        };

        populateLocation = function() {
            $('#editgearpricingloc-form #editgearpricing-city').val(this.gear.data.city);
            $('#editgearpricingloc-form #editgearpricing-address').val(this.gear.data.address);
            $('#editgearpricingloc-form #editgearpricing-postalcode').val(this.gear.data.postal_code);
            $('#editgearpricingloc-form #editgearpricing-region').val(this.gear.data.region);
        };

        populateCountry = function() {
            var countryList = App.localization.getCountries(),
                currentCountry = this.gear.data.country,
                html = '',
                $countrySelect,i;

            $countrySelect = $('#editgearpricing-country', this.$element);
            $countrySelect.empty();

            for(i = 0; i < countryList.length; i++) {
                html += '<option value="' + countryList[i].alpha2 + '">' + countryList[i].name + '</option>';
            }
            $countrySelect.html(html);
            $countrySelect.val(currentCountry.toLowerCase());
        };

		populateBrandSelect = function() {
			var brands = App.gearClassification.data.brands,
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
			var gearClassification = App.gearClassification.data.classification,
				html = '<option> Choose subtype: </option>',
				$subtypeSelect,
				gearSubtypes, i;

			$subtypeSelect = $('#editgear-subtype', this.$element);
			$subtypeSelect.empty();

			gearSubtypes = gearClassification[this.gear.data.type];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i] + '">' + gearSubtypes[i] + '</option>';
			}
			$subtypeSelect.append(html);
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

        handleDeliveryCheckbox = function(){
            if(this.checked === true) {
                $(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled');
            }
            else {
                $(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
            }
        };

		handleCancel = function() {
            var currentVerticalPosition = $(window).scrollTop();
            App.router.closeModalView();
            $('body, html').animate({scrollTop: currentVerticalPosition},50);
		};

		handleImageUpload = function(event) {
			var view = event.data,
				$file = $(this);
			view.gear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
				var $thumbList, html;
				$('#editgear-form-imageupload').val('');
				if(error) {
					alert('Error uploading file.');
					console.log(error);
					return;
				}

				console.log('Edit picture URL: ' + url);

				$thumbList = $('#editgear-photos-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);
			});
		};

		handleSave = function(event) {
			var view = event.data,
			isLocationSame = false,
			currentAddress = view.gear.data.address,
			currentPostalCode = view.gear.data.postalcode,
			currentCity = view.gear.data.city,
			currentRegion = view.gear.data.region,
			currentCountry = view.gear.data.country,
			updatedGearData,
			addressOneliner,
			updateCall,
            currentBtn = $(this),
            alwaysFlag = view.alwaysFlag,
            availabilityArray = [],
            month, monthSelections, selection, j;

            currentBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

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
            view.gear.setAvailability(App.user.data.id, availabilityArray, alwaysFlag, function() {});

			updatedGearData = {
				brand: $('#editgear-brand option:selected', view.$element).val(),
				subtype: $('#editgear-subtype option:selected', view.$element).val(),
				model: $('#editgear-model', view.$element).val(),
				description: $('#editgear-description', view.$element).val(),
				price_a: $('#editgearpricing-form #price_a', this.$element).val(),
				price_b: $('#editgearpricing-form #price_b', this.$element).val(),
				price_c: $('#editgearpricing-form #price_c', this.$element).val(),
                delivery_price: '',
                delivery_distance: '',
				address: $('#editgearpricingloc-form #editgearpricing-address', this.$element).val(),
				postal_code: $('#editgearpricingloc-form #editgearpricing-postalcode', this.$element).val(),
				city: $('#editgearpricingloc-form #editgearpricing-city', this.$element).val(),
				region: $('#editgearpricingloc-form #editgearpricing-region', this.$element).val(),
				country: $('#editgearpricingloc-form #editgearpricing-country option:selected').val()
            };

            if ($('#editgear-subtype', view.$element).selectedIndex===0) {
                alert('The subtype field is required.');
                return;
            }
            if ($('#editgear-brand', view.$element).selectedIndex===0) {
                alert('The brand field is required.');
                return;
            }
            if ($('#editgear-model', view.$element).val()==='') {
                alert('The model field is required.');
                return;
            }
            if ($('#editgearpricing-form #price_a', this.$element).val()==='') {
                alert('The rental price field is required.');
                return;
            }
            if ($('#editgearpricing-form #price_b', this.$element).val()==='') {
                alert('The rental price field is required.');
                return;
            }
            if ($('#editgearpricing-form #price_c', this.$element).val()==='') {
                alert('The rental price field is required.');
                return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-address', this.$element).val()==='') {
                alert('The address field is required.');
                return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-postalcode', this.$element).val()==='') {
                alert('The postalcode field is required.');
                return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-city', this.$element).val()==='') {
                alert('The city field is required.');
                return;
            }
            if ($('#editgearpricingloc-form #editgearpricing-country').selectedIndex===0||
                $('#editgearpricingloc-form #editgearpricing-country').selectedIndex===null) {
                alert('The country field is required.');
                return;
            }

            _.extend(view.gear.data, updatedGearData);

			updateCall = function() {
				view.gear.save(App.user.data.id, function(error) {
                    currentBtn.text('Save');
                    if(error) {
						console.log(error);
						return;
					}
					App.router.closeModalView();
				});
			};

			isLocationSame = (currentAddress === updatedGearData.address &&
				currentPostalCode === updatedGearData.postal_code &&
				currentCity === updatedGearData.city &&
				currentRegion === updatedGearData.region &&
				currentCountry === updatedGearData.country);

			if(isLocationSame === false) {
				addressOneliner = updatedGearData.address + ', ' + updatedGearData.postalcode + ' ' + updatedGearData.city + ', ' + updatedGearData.region + ', ' + updatedGearData.country;
				geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.gear.data.longitude = results[0].geometry.location.lng();
						view.gear.data.latitude = results[0].geometry.location.lat();
						updateCall();
					}
					else {
                        alert('The address is not valid!');
					}
				});
			}
			else {
				updateCall();
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

        handleNextButton = function(event) {
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

        //TODO: Optimize to join adjacent selections
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

        return ViewController.inherit({
            didInitialize: didInitialize,
            didRender: didRender,

            populateBrandSelect: populateBrandSelect,
            populateSubtypeSelect: populateSubtypeSelect,

            populateImages: populateImages,
            handleImageUpload: handleImageUpload,

            populateLocation: populateLocation,
            populateCountry: populateCountry,
            populateDelivery:populateDelivery,
            handleDeliveryCheckbox:handleDeliveryCheckbox,

            initAvailability:initAvailability,
            renderAvailability:renderAvailability,
            renderMonthCalendar:renderMonthCalendar,
            setupMonthCalendar:setupMonthCalendar,
            clearSelections:clearSelections,
            renderSelections:renderSelections,
            addCellsToSelections:addCellsToSelections,
            handleToday:handleToday,
            handlePrevious:handlePrevious,
            handleNextButton: handleNextButton,
            handleClearMonth:handleClearMonth,
            handleAlwaysAvailable:handleAlwaysAvailable,
            handleNeverAvailable:handleNeverAvailable,

            handleDayStartSelect:handleDayStartSelect,
            handleDayMoveSelect:handleDayMoveSelect,
            handleDayEndSelect:handleDayEndSelect,

            handleCancel: handleCancel,
            handleSave: handleSave,

            isBeforeOrSameDay:isBeforeOrSameDay,
            isAfterOrSameDay:isAfterOrSameDay
        });

	}
);
