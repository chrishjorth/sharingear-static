/**
 * Controller for the Sharingear Add gear dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    GoogleMaps = require('../libraries/mscl-googlemaps.js'),
    Moment = require('moment-timezone'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    Localization = require('../models/localization.js'),
    ContentClassification = require('../models/contentclassification.js'),
    Gear = require('../models/gear.js'),

    subtypeDefault = 'Choose subtype:',
    brandDefault = 'Choose brand:',
    countryDefault = 'Select country:',
    geocoder;

geocoder = new GoogleMaps.Geocoder();

function AddGear(options) {
    ViewController.call(this, options);
}

AddGear.prototype = new ViewController();

AddGear.prototype.didInitialize = function() {
    if (App.user.data.id === null) {
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
    this.submerchantFormVC = null;

    this.templateParameters = {
        currency: App.user.data.currency
    };

    this.newGear = new Gear({
        rootURL: Config.API_URL
    });
    this.newGear.initialize();

    this.hasDelivery = false;

    this.shownMoment = new Moment.tz(Localization.getCurrentTimeZone());
    this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
    this.alwaysFlag = 1; //New gear is always available by default
    this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
};

AddGear.prototype.didRender = function() {
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

    window.mixpanel.track('View addgear');
};

AddGear.prototype.getTabID = function() {
    var tabID = null;
    $('.addgear-panel').each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            tabID = $this.attr('id');
        }
    });
    return tabID;
};

AddGear.prototype.populatePriceSuggestions = function() {
    var gearClassification = ContentClassification.data.gearClassification,
        view, gearSubtypes, i, suggestionA, suggestionB, suggestionC;

    view = this;

    gearSubtypes = gearClassification[view.newGear.data.gear_type];
    for (i = 0; i < gearSubtypes.length; i++) {
        if (gearSubtypes[i].subtype === view.newGear.data.subtype) {
            suggestionA = gearSubtypes[i].price_a_suggestion;
            suggestionB = gearSubtypes[i].price_b_suggestion;
            suggestionC = gearSubtypes[i].price_c_suggestion;
            i = gearSubtypes.length;
        }
    }
    Localization.convertPrice(suggestionA, App.user.data.currency, function(error, convertedPrice) {
        if (error) {
            console.log('Could not convert price: ' + error);
            return;
        }
        $('#addgear-price_a-suggestion', view.$element).html(Math.ceil(convertedPrice));
    });
    Localization.convertPrice(suggestionB, App.user.data.currency, function(error, convertedPrice) {
        if (error) {
            console.log('Could not convert price: ' + error);
            return;
        }
        $('#addgear-price_b-suggestion', view.$element).html(Math.ceil(convertedPrice));
    });
    Localization.convertPrice(suggestionC, App.user.data.currency, function(error, convertedPrice) {
        if (error) {
            console.log('Could not convert price: ' + error);
            return;
        }
        $('#addgear-price_c-suggestion', view.$element).html(Math.ceil(convertedPrice));
    });
};

AddGear.prototype.toggleLoading = function() {
    if (this.isLoading === true) {
        $('.next-btn', this.$element).html('Next <i class="fa fa-arrow-circle-right"></i>');
        this.isLoading = false;
    } else {
        $('.next-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
        this.isLoading = true;
    }
};

AddGear.prototype.addGearIcons = function() {
    var view = this,
        gearClassification = ContentClassification.data.gearClassification,
        html = '',
        gearType;

    for (gearType in gearClassification) {
        html += '<div class="custom-radio">';
        html += '<input type="radio" name="gear-radio" id="gear-radio-' + gearType + '" value="' + gearType + '">';
        html += '<label for="gear-radio-' + gearType + '">';
        html += '<div class="custom-radio-icon sg-icon icon-addgear-' + gearType.toLowerCase() + '"></div>';
        html += '<span>' + gearType + '</span>';
        html += '</label>';
        html += '</div>';
    }

    $('.gearbuttonlist-container', view.$element).append(html);
};

AddGear.prototype.renderAccessories = function() {
    var view = this,
        gearClassification = ContentClassification.data.gearClassification,
        html = '',
        gearType, gearSubtypes, i, j;

    gearType = $('#addgear-form-type input[type="radio"]:checked').val();

    gearSubtypes = gearClassification[gearType];

    for (i = 0; i < gearSubtypes.length; i++) {
        if (gearSubtypes[i].subtype === $('#addgear-form-subtype', view.$element).val()) {
            for (j = 0; j < gearSubtypes[i].accessories.length; j++) {
                //Check the checkbox if the specific accessory was selected for this gear before
                if (view.newGear.data.accessories !== null && view.newGear.data.accessories.indexOf(gearSubtypes[i].accessories[j]) > -1) {
                    html += '<input type="checkbox" name="' + gearSubtypes[i].accessories[j] + '" value="' + gearSubtypes[i].accessories[j] + '" checked> ' + gearSubtypes[i].accessories[j];
                } else {
                    html += '<input type="checkbox" name="' + gearSubtypes[i].accessories[j] + '" value="' + gearSubtypes[i].accessories[j] + '"> ' + gearSubtypes[i].accessories[j];
                }
            }
        }
    }
    $('#addgear-accessories-container', view.$element).html(html);
};

/**
 * Prefills the form with passed data.
 */
AddGear.prototype.prepopulateInstrument = function() {
    var gear;
    if (!this.passedData || this.passedData === null) {
        return;
    }
    gear = this.passedData.data;
    if (!gear) {
        return;
    }
    if (gear.gear_type && gear.gear_type.length >= 0) {
        $('#dashboard-addgear-form .gearbuttonlist-container #gear-radio-' + gear.gear_type.toLowerCase()).prop('checked', true);
        this.populateSubtypeSelect(gear.gear_type);
        if (gear.subtype && gear.subtype.length >= 0) {
            $('#gear-subtype-container select').val(gear.subtype);
            this.populateBrandSelect();
            if (gear.brand && gear.brand.length >= 0) {
                $('#gear-brand-container select').val(gear.brand);
            }
        }
    }
    $('#dashboard-addgear-form-model').val(gear.model);
    $('#dashboard-addgear-form-description').val(gear.description);
};

AddGear.prototype.populateSubtypeSelect = function(gearType) {
    var gearClassification = ContentClassification.data.gearClassification,
        html = '<option> ' + subtypeDefault + ' </option>',
        $subtypeSelect, $brandSelectContainer, $detailsContainer, gearSubtypes, i;

    $('#addgear-form-subtype-container', this.$element).removeClass('hidden');

    $subtypeSelect = $('#addgear-form-subtype-container select', this.$element);
    $subtypeSelect.empty();

    $brandSelectContainer = $('#addgear-form-brand-container', this.$element);
    if ($brandSelectContainer.hasClass('hidden') === false) {
        $brandSelectContainer.addClass('hidden');
    }

    $detailsContainer = $('#addgear-form-geardetails-container', this.$element);
    if ($detailsContainer.hasClass('hidden') === false) {
        $detailsContainer.addClass('hidden');
    }

    gearSubtypes = gearClassification[gearType];
    for (i = 0; i < gearSubtypes.length; i++) {
        html += '<option value="' + gearSubtypes[i].subtype + '">' + gearSubtypes[i].subtype + '</option>';
    }
    $subtypeSelect.append(html);
    this.setupEvent('change', '#addgear-form-subtype-container select', this, this.handleSelectSubtype);
};

AddGear.prototype.populateBrandSelect = function() {
    var brands = ContentClassification.data.gearBrands,
        html = '<option> ' + brandDefault + ' </option>',
        $brandSelect, $detailsContainer, i;

    $('#addgear-form-brand-container', this.$element).removeClass('hidden');

    $brandSelect = $('#addgear-form-brand-container select', this.$element);
    $brandSelect.empty();

    $detailsContainer = $('#addgear-form-geardetails-container', this.$element);
    if ($detailsContainer.hasClass('hidden') === false) {
        $detailsContainer.addClass('hidden');
    }

    for (i = 0; i < brands.length; i++) {
        html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
    }
    $brandSelect.append(html);
    this.setupEvent('change', '#addgear-form-brand-container select', this, this.handleSelectBrand);
};

/**
 * @assertion: gearClassification has been loaded
 */
AddGear.prototype.handleGearRadio = function(event) {
    var view = event.data;
    $('.hint1', view.$element).addClass('hidden');
    view.populateSubtypeSelect($(this).val());
};

AddGear.prototype.handleSelectSubtype = function(event) {
    var view = event.data;
    view.populateBrandSelect();
    view.renderAccessories();
};

AddGear.prototype.handleSelectBrand = function(event) {
    var view = event.data;
    $('#addgear-form-geardetails-container', view.$element).removeClass('hidden');
    var gearSubType = $('#addgear-form-subtype').val();
    if(gearSubType==='Acoustic drums'||gearSubType==='Cymbals'||
        gearSubType==='Electronic drums'||gearSubType==='Percussion'){
        
        $('#addgear-form-description', view.$element).attr("placeholder", "Please remember to specify the size of the each item in the set.");
        $('#addgear-form-model', view.$element).attr("placeholder", "");

    }else if (gearSubType==='Snare drum'){
        $('#addgear-form-model', view.$element).attr("placeholder", 'Ex: Snare Drum Black Beauty 14x4"');
        $('#addgear-form-description', view.$element).attr("placeholder", "");
    }else if(gearSubType==='Floor tom'){
        $('#addgear-form-model', view.$element).attr("placeholder", 'Ex: Roadshow Floor Tom 14x14"');
        $('#addgear-form-description', view.$element).attr("placeholder", "");
    }else if(gearSubType==='Bass drum'){
        $('#addgear-form-model', view.$element).attr("placeholder", 'Ex: Maple Bass Drum 22x18"');
        $('#addgear-form-description', view.$element).attr("placeholder", "");
    }else if(gearSubType==='Rack tom'){
        $('#addgear-form-model', view.$element).attr("placeholder", 'Ex: Rocker Rack Tom 12x8"');
        $('#addgear-form-description', view.$element).attr("placeholder", "");
    }
};

AddGear.prototype.saveInstrument = function() {
    var view = this,
        accessoriesArray = [],
        newData, callback;

    if (view.isLoading === true) {
        return;
    }

    //Push the checked checkboxes to an array
    Array.prototype.push.apply(accessoriesArray, $('#addgear-accessories-container input:checked', view.$element).map(function() {
        return this.name;
    }));

    //Create new gear model object from form data
    newData = {
        gear_type: $('#addgear-form-type .gearbuttonlist-container input[type="radio"]:checked').val(),
        subtype: $('#addgear-form-subtype option:selected').val(),
        brand: $('#addgear-form-brand option:selected').val(),
        model: $('#addgear-form-model').val(),
        accessories: accessoriesArray,
        description: $('#addgear-form-description').val(),
        currency: App.user.data.currency
    };

    //Validate
    if (!newData.gear_type || newData.gear_type === '') {
        alert('Please select a type of instrument.');
        return;
    }
    if (newData.subtype === '' || newData.subtype === subtypeDefault) {
        alert('Please select a subtype for your instrument.');
        return;
    }
    if (newData.brand === '' || newData.brand === brandDefault) {
        alert('Please select the instrument\'s brand.');
        return;
    }
    if (newData.model === '') {
        alert('Please type in the model of your instrument.');
        return;
    }

    this.toggleLoading();

    _.extend(this.newGear.data, newData);

    callback = function(error) {
        if (error) {
            alert('Error saving gear');
            return;
        }

        view.showPanel('#addgear-panel-photos');
        window.mixpanel.track('View addgear-photos');

        view.toggleLoading();
    };

    if (this.newGear.data.id === null) {
        this.newGear.createGear(App.user, callback);
    } else {
        //Case of the user tabbing back
        this.newGear.save(App.user.data.id, callback);
    }

    this.populatePriceSuggestions();
};

AddGear.prototype.populatePhotos = function() {
    var images = this.newGear.data.images.split(','),
        html = '',
        i;
    for (i = 0; i < images.length; i++) {
        //Avoid empty url strings because of trailing ','
        if (images[i].length > 0) {
            html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
        }
    }
    $('#dashboard-addgearphotos-form .thumb-list-container ul', this.$element).append(html);
};

AddGear.prototype.handleImageUpload = function(event) {
    var view = event.data,
        $file = $(this);

    view.toggleLoading();

    view.newGear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
        var $thumbList, html;
        if (error) {
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

AddGear.prototype.populateCountries = function($select) {
    var html = $('option', $select).first()[0].outerHTML,
        countriesArray, i;
    countriesArray = Localization.getCountries();
    for (i = 0; i < countriesArray.length; i++) {
        html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m) {
            return m.toUpperCase();
        }) + '</option>';
    }

    $select.html(html);
};

AddGear.prototype.handlePriceChange = function() {
    var $this = $(this),
        price;
    price = parseInt($this.val(), 10);
    if (isNaN(price)) {
        price = '';
    }
    $this.val(price);
};

AddGear.prototype.handleDeliveryCheckbox = function(event) {
    var view = event.data;
    if (this.checked === true) {
        view.hasDelivery = true;
        $(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled');
    } else {
        view.hasDelivery = false;
        $(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
    }
};

AddGear.prototype.savePriceLocation = function() {
    var view = this,
        isLocationSame, addressOneliner, newGearData, saveCall,
        currentAddress, currentPostalCode, currentCity, currentRegion, currentCountry, didLocationChange;

    if (view.isLoading === true) {
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
        currency: App.user.data.currency,
        address: $('#dashboard-addgearprice-form #dashboard-addgearprice-address', this.$element).val(),
        postal_code: $('#dashboard-addgearprice-form #dashboard-addgearprice-postalcode', this.$element).val(),
        city: $('#dashboard-addgearprice-form #dashboard-addgearprice-city', this.$element).val(),
        region: $('#dashboard-addgearprice-form #dashboard-addgearprice-region', this.$element).val(),
        country: $('#dashboard-addgearprice-form #dashboard-addgearprice-country option:selected').val()
    });

    if (this.hasDelivery === true) {
        this.newGear.data.delivery_price = $('#dashboard-addgearprice-form input[name="delivery_price"]', this.$element).val();
        this.newGear.data.delivery_distance = $('#dashboard-addgearprice-form input[name="delivery_distance"]', this.$element).val();
    }

    newGearData = this.newGear.data;

    //Validation
    if (newGearData.price_a === '') {
        alert('Price is missing.');
        return;
    }
    if (newGearData.price_a % 1 !== 0) {
        alert('Hourly price is invalid.');
        return;
    }
    if (newGearData.price_b === '') {
        alert('Price is missing.');
        return;
    }
    if (newGearData.price_b % 1 !== 0) {
        alert('Daily is invalid.');
        return;
    }
    if (newGearData.price_c === '') {
        alert('Price is missing.');
        return;
    }
    if (newGearData.price_c % 1 !== 0) {
        alert('Weekly is invalid.');
        return;
    }
    if (this.hasDelivery === true && newGearData.delivery_price === '') {
        alert('Delivery price is missing.');
        return;
    }
    if (this.hasDelivery === true && newGearData.delivery_distance === '') {
        alert('Delivery distance is missing.');
        return;
    }
    if (newGearData.address === '') {
        alert('Address is missing');
        return;
    }
    if (newGearData.postal_code === '') {
        alert('Postal code is missing.');
        return;
    }
    if (newGearData.city === '') {
        alert('City is missing.');
        return;
    }
    if (newGearData.country === '' || newGearData.country === countryDefault) {
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
            view.toggleLoading();
            if (error) {
                alert('Error saving data');
                return;
            }
            view.showPanel('#addgear-panel-availability');
            if (App.user.isSubMerchant() === false) {
                view.renderSubmerchantForm();
                window.mixpanel.track('View addgear-submerchantform');
            } else {
                view.renderAvailability();
                window.mixpanel.track('View addgear-availability');
            }
        });
    };

    if (isLocationSame === false) {
        addressOneliner = newGearData.address + ', ' + newGearData.postal_code + ' ' + newGearData.city + ', ' + newGearData.country;
        geocoder.geocode({
            'address': addressOneliner
        }, function(results, status) {
            if (status === GoogleMaps.GeocoderStatus.OK) {
                view.newGear.data.longitude = results[0].geometry.location.lng();
                view.newGear.data.latitude = results[0].geometry.location.lat();

                for (var i=0; i<results[0].address_components.length; i++){
                    if (results[0].address_components[i].types[0] === "country") {
                        view.newGear.data.country = results[0].address_components[i].long_name;
                    }
                }                

                saveCall();
            } else {
                console.log('Error geocoding: ' + status);
                alert('Address error');
                view.toggleLoading();
            }
        });
    } else {
        saveCall();
    }
};

AddGear.prototype.renderAvailability = function() {
    var view = this,
        $calendarContainer, CalendarVC, calendarVT;

    $calendarContainer = $('#addgear-availability-calendar', this.$element);
    $calendarContainer.removeClass('hidden');

    $('#addgear-darkgray-left', this.$element).hide();
    $('#addgear-darkgray-left-calendar', this.$element).removeClass('hidden');

    CalendarVC = require('./availabilitycalendar.js');
    calendarVT = require('../../templates/availabilitycalendar.html');

    view.calendarVC = new CalendarVC({
        name: 'availabilitycalendar',
        $element: $calendarContainer,
        template: calendarVT,
        passedData: {
            gear: view.newGear
        }
    });
    view.calendarVC.initialize();
    view.newGear.getAvailability(App.user.data.id, function(error, result) {
        var selections = {},
            availabilityArray, i, startMoment, endMoment;

        if (error) {
            console.log('Error retrieving van availability: ' + error);
            return;
        }

        availabilityArray = result.availabilityArray;
        for (i = 0; i < availabilityArray.length; i++) {
            startMoment = new Moment.tz(availabilityArray[i].start, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
            endMoment = new Moment.tz(availabilityArray[i].end, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
            if (Array.isArray(selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
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
};

AddGear.prototype.renderSubmerchantForm = function() {
    var $submerchantFormContainer = $('#addgear-availability-calendar', this.$element),
        view = this,
        SubmerchantFormVC, submerchantFormVT;

    SubmerchantFormVC = require('./submerchantregistration.js');
    submerchantFormVT = require('../../templates/submerchantregistration.html');

    view.submerchantFormVC = new SubmerchantFormVC({
        name: 'submerchantform',
        $element: $submerchantFormContainer,
        template: submerchantFormVT
    });
    view.submerchantFormVC.initialize();
    view.submerchantFormVC.render();
};

AddGear.prototype.saveAvailability = function() {
    var view = this,
        availabilityArray = [],
        selections, alwaysFlag, month, monthSelections, selection, j;

    if (view.isLoading === true) {
        return;
    }

    view.toggleLoading();

    if (view.calendarVC !== null) {
        selections = view.calendarVC.getSelections();
        alwaysFlag = view.calendarVC.getAlwaysFlag();
    } else {
        //For some reason the availability calendar did not load, so we set to never available as default.
        selections = {};
        alwaysFlag = 0;
    }

    for (month in selections) {
        monthSelections = selections[month];
        for (j = 0; j < monthSelections.length; j++) {
            selection = monthSelections[j];
            availabilityArray.push({
                start_time: selection.startMoment.format('YYYY-MM-DD') + ' 00:00:00',
                end_time: selection.endMoment.format('YYYY-MM-DD') + ' 23:59:59'
            });
        }
    }

    view.newGear.setAvailability(App.user.data.id, availabilityArray, alwaysFlag, function(error) {
        if (error) {
            alert('Error saving gear availability.');
            console.log(error);
            return;
        }
        view.toggleLoading();
        $('.footer', view.$element).addClass('hidden');
        view.showPanel('#addgear-panel-final');
        view.setupEvent('click', '.profile-btn', view, view.handleViewGearProfile);
        view.setupEvent('click', '.addmore-btn', view, view.handleAddMoreGear);
        window.mixpanel.track('View addgear-final');
    });
};

AddGear.prototype.handleCancel = function() {
    App.router.closeModalView();
};

AddGear.prototype.handleNext = function(event) {
    var view = event.data,
        currentTabID;

    currentTabID = view.getTabID();

    switch (currentTabID) {
        case 'addgear-panel-type':
            view.saveInstrument();
            break;
        case 'addgear-panel-photos':
            if (view.isLoading === false) {
                view.showPanel('#addgear-panel-pricelocation');
                window.mixpanel.track('View addgear-pricelocation');
            }
            break;
        case 'addgear-panel-pricelocation':
            view.savePriceLocation();
            break;
        case 'addgear-panel-availability':
            if (view.submerchantFormVC !== null) {
                view.toggleLoading();
                view.submerchantFormVC.submitForm(function(error) {
                    view.toggleLoading();
                    if (error) {
                        console.log(error);
                        return;
                    }
                    view.submerchantFormVC.close();
                    view.submerchantFormVC = null;
                    view.renderAvailability();
                    window.mixpanel.track('View addgear-availability');
                });
            } else {
                view.saveAvailability();
            }
            break;
        default:
            console.log('Something went wrong.');
    }
};

AddGear.prototype.handleViewGearProfile = function(event) {
    var view = event.data;
    App.router.closeModalView();
    App.router.navigateTo('gearprofile/' + view.newGear.data.id);
};

AddGear.prototype.handleAddMoreGear = function() {
    App.router.closeModalView();
    App.router.openModalView('addgear');
};

AddGear.prototype.showPanel = function(panelID) {
    $('.addgear-panel', this.$element).each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            $this.addClass('hidden');
        }
    });
    $(panelID, this.$element).removeClass('hidden');
};

module.exports = AddGear;
