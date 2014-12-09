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

            toggleLoading,

            populateBrandSelect,
            populateSubtypeSelect,
			populateAccessories,

            populateImages,
            handleImageUpload,

            populateLocation,
            populateCountries,
            populateDelivery,
            handleDeliveryCheckbox,

			initAccessories,
            initAvailability,
            renderAvailability,
            handleSubmerchantSubmit,
            handleSubmerchantAccept,
            renderMonthCalendar,
            setupMonthCalendar,
            clearSelections,
            renderSelections,
            handleToday,
            handlePrevious,
            handleNextButton,
            handleClearMonth,
            handleAlwaysAvailable,
            handleNeverAvailable,
            handleDayStartSelect,
            handleDayMoveSelect,
            handleDayEndSelect,
			handlePriceChange,

            handleCancel,
            handleSave,

            isBeforeOrSameDay,
            isAfterOrSameDay;

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
            this.initAvailability();

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

            this.setupEvent('click', '.btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '.btn-save', this, this.handleSave);
            this.setupEvent('change', '#editgear-photos-form-imageupload', this, this.handleImageUpload);
            this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
			this.setupEvent('change', '.price', this, this.handlePriceChange);
			this.setupEvent('change', '#editgear-subtype', this, this.populateAccessories);

            this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
            this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
            this.setupEvent('click', '#gearavailability-next-btn', this, this.handleNextButton);
            this.setupEvent('click', '#gearavailability-clearmonth-btn', this, this.handleClearMonth);
            this.setupEvent('click', '#gearavailability-always-btn', this, this.handleAlwaysAvailable);
            this.setupEvent('click', '#gearavailability-never-btn', this, this.handleNeverAvailable);
            this.setupEvent('mousedown touchstart', '#gearavailability-months-container .day-row .day', this, this.handleDayStartSelect);
        };

        toggleLoading = function() {
            if(this.isLoading === true) {
                $('#editgear-save-btn', this.$element).html('Next');
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
			var gearClassification = App.gearClassification.data.classification,
				html = "",
				view,gearSubtypes,i;

			view = this;

			gearSubtypes = gearClassification[view.gear.data.gear_type];

			for(i = 0; i < gearSubtypes.length; i++) {
				if (gearSubtypes[i].subtype === $('#editgear-subtype',view.$element).val()) {
					var j;
					for(j=0;j<gearSubtypes[i].accessories.length;j++){
						html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'"> '+gearSubtypes[i].accessories[j];
					}
				}
			}
			$('#editgear-accessories-container',view.$element).html(html);
		};

        renderAvailability = function() {
            if(App.user.isSubMerchant() === true) {
                $('#editgear-availability-calendar', this.$element).removeClass('hidden');
                this.renderMonthCalendar($('#gearavailability-months-container'));
                this.setupMonthCalendar();
                this.clearSelections();
                this.renderSelections();
            }
            else {
                var user = App.user.data;

                $('#editgear-availability-submerchantform', this.$element).removeClass('hidden');

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

                this.setupEvent('submit', '#editgear-submerchantform', this, this.handleSubmerchantSubmit);
                this.setupEvent('click', '#submerchantregistration-accept', this, this.handleSubmerchantAccept);
            }
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

        initAvailability = function() {
            var view = this;

            this.shownMoment = new Moment();

            this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
            this.alwaysFlag = 0;

            this.gear.getAvailability(App.user.data.id, function(error, result) {
                var availabilityArray = result.availabilityArray,
                    i, startMoment, endMoment;

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

        populateCountries = function($select) {
            var countriesArray = App.localization.getCountries(),
                html = $('option', $select).first()[0].outerHTML,
                i;
            for(i = 0; i < countriesArray.length; i++) {
                html += '<option value="' + countriesArray[i].alpha2 + '">' + countriesArray[i].name + '</option>';
            }
            $select.html(html);
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

			gearSubtypes = gearClassification[this.gear.data.gear_type];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i].subtype + '">' + gearSubtypes[i].subtype + '</option>';
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

		populateAccessories = function (event) {
            var gearClassification = App.gearClassification.data.classification,
                html = "",
                view,gearSubtypes,i;
			
            view = event.data;

			gearSubtypes = gearClassification[view.gear.data.gear_type];
			for(i = 0; i < gearSubtypes.length; i++) {
				if (gearSubtypes[i].subtype === $('#editgear-subtype',this.$element).val()) {
					var j;
					for(j = 0;j<gearSubtypes[i].accessories.length;j++){
						html += '<input type="checkbox" name="'+gearSubtypes[i].accessories[j]+'" value="'+gearSubtypes[i].accessories[j]+'"> '+gearSubtypes[i].accessories[j];
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
                updatedGearData, addressOneliner, updateCall, month, monthSelections, selection, j;

            if(view.isLoading === true) {
                return;
            }

			view.toggleLoading();

            //Convert selections to availability array
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

            view.gear.setAvailability(App.user.data.id, availabilityArray, view.alwaysFlag, function(error) {
                if(error) {
                    alert('Error saving availability.');
                    console.log(error);
                    view.toggleLoading();
                }
            });

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
				view.gear.save(App.user.data.id, function(error) {
                    if(error) {
                        alert('Error updating gear.');
						console.log(error);
                        view.toggleLoading();
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
            var moment, today, startDay, $calendarContainer, $dayBox, row, col, date;

            today = new Moment();
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
                    if(moment.month() !== this.shownMoment.month() || moment.isBefore(today)) {
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

        handleNextButton = function(event) {
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

			$('#gearavailability-never-btn',view.$element).addClass('button-selected-state');
			$('#gearavailability-always-btn',view.$element).removeClass('button-selected-state');

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

            //Scan selections for this month and cleanup overlaps and merge adiacent days
            monthSelections = view.selections[key];
            i = 0;
            while(i < monthSelections.length) {
                currentSelection = monthSelections[i];
                j = i + 1;
                didSplice = false;
                //Match a selection against all the following selections
                while(j < monthSelections.length) {
                    startMomentA = currentSelection.startMoment;
                    endMomentA = currentSelection.endMoment;
                    startMomentB = monthSelections[j].startMoment;
                    endMomentB = monthSelections[j].endMoment;
                    if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(startMomentA, endMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
                        //startA is between B and endA is after endB: startA becomes startB so that B is included in A, then remove B
                        currentSelection.startMoment = startMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
                        //startB is between A and endB is after endA: endA becomes endB so that B is included in A, then remove B
                        currentSelection.endMoment = endMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
                        //B is included in A: remove B
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
                        //A is included in B: A becomes B, then remove B
                        currentSelection.startMoment = startMomentB;
                        currentSelection.endMoment = endMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(endMomentB.date() + 1 === startMomentA.date() && endMomentB.month() === startMomentA.month() && endMomentB.year() === startMomentA.year()) {
                        //B is left adjacent to A: startA becomes startB so that they are joined, remove B
                        currentSelection.startMoment = startMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(endMomentA.date() + 1 === startMomentB.date() && endMomentA.month() === startMomentB.month() && endMomentA.year() === startMomentB.year()) {
                        //B is right adjacent to A: endA becomes endB so that they are joined, remove A
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

        return ViewController.inherit({
            didInitialize: didInitialize,
            didRender: didRender,

            toggleLoading: toggleLoading,

            populateBrandSelect: populateBrandSelect,
            populateSubtypeSelect: populateSubtypeSelect,
			populateAccessories:populateAccessories,

            populateImages: populateImages,
            handleImageUpload: handleImageUpload,

            populateLocation: populateLocation,
            populateCountries: populateCountries,
            populateDelivery:populateDelivery,
            handleDeliveryCheckbox:handleDeliveryCheckbox,
			handlePriceChange:handlePriceChange,

			initAccessories:initAccessories,
            initAvailability:initAvailability,
            renderAvailability:renderAvailability,
            handleSubmerchantSubmit: handleSubmerchantSubmit,
            handleSubmerchantAccept: handleSubmerchantAccept,
            renderMonthCalendar:renderMonthCalendar,
            setupMonthCalendar:setupMonthCalendar,
            clearSelections:clearSelections,
            renderSelections:renderSelections,
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
