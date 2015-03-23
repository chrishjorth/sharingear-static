/**
 * Controller for the Sharingear Add van view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    GoogleMaps = require('googlemaps'),
    Moment = require('moment-timezone'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller'),
    App = require('../app.js'),

    Localization = require('../models/localization.js'),
    Van = require('../models/van.js'),

    countryDefault = 'Select country:',
    geocoder,

    didInitialize,
    didRender,

    getTabID,
    toggleLoading,

    addVanIcons,
    renderAccessories,
    prepopulateVan,
    handleVanRadio,
    saveVan,

    populatePhotos,
    handleImageUpload,

    populateCountries,
    populatePriceSuggestions,
    handlePriceChange,
    handleDeliveryCheckbox,
    savePriceLocation,

    renderAvailability,
    renderSubmerchantForm,
    saveAvailability,

    handleCancel,
    handleNext,
    handleViewVanProfile,
    handleAddMoreVans,

    showPanel;

geocoder = new GoogleMaps.Geocoder();

didInitialize = function() {
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

    this.newVan = new Van.constructor({
        rootURL: Config.API_URL
    });
    this.newVan.initialize();

    this.hasDelivery = false;

    this.shownMoment = new Moment.tz(Localization.getCurrentTimeZone());
    this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
    this.alwaysFlag = 1; //New vans are always available by default
    this.dragMakeAvailable = true; //Dragging on availability sets to available if this parameter is true, sets to unavailable if false
};

didRender = function() {
    var $accessoriesContainer = $('#addvan-accessories', this.$element);
    if ($accessoriesContainer.hasClass('hidden') === false) {
        $accessoriesContainer.addClass('hidden');
    }

    this.addVanIcons();

    this.prepopulateVan();

    this.populatePhotos();
    this.populateCountries($('#dashboard-addvanprice-country', this.$element));

    $('#dashboard-addvanprice-form #price_a', this.$element).val(this.newVan.data.price_a);
    $('#dashboard-addvanprice-form #price_b', this.$element).val(this.newVan.data.price_b);
    $('#dashboard-addvanprice-form #price_c', this.$element).val(this.newVan.data.price_c);

    this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
    this.setupEvent('click', '.next-btn', this, this.handleNext);
    this.setupEvent('change', '#addvan-form-type .vanbuttonlist-container input[type="radio"]', this, this.handleVanRadio);
    this.setupEvent('change', '#dashboard-addvanphotos-form-imageupload', this, this.handleImageUpload);

    this.setupEvent('change', '.price', this, this.handlePriceChange);
    this.setupEvent('change', '#van-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
};

getTabID = function() {
    var tabID = null;
    $('.addvan-panel').each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            tabID = $this.attr('id');
        }
    });
    return tabID;
};

populatePriceSuggestions = function() {
    var vanClassification = App.contentClassification.data.vanClassification,
        view = this,
        i, suggestionA, suggestionB, suggestionC;

    for (i = 0; i < vanClassification.length; i++) {
        if (vanClassification[i].vanType === view.newVan.data.van_type) {
            suggestionA = vanClassification[i].price_a_suggestion;
            suggestionB = vanClassification[i].price_b_suggestion;
            suggestionC = vanClassification[i].price_c_suggestion;
            i = vanClassification.length;
        }
    }
    Localization.convertPrices([suggestionA, suggestionB, suggestionC], 'EUR', App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.log('Could not convert price suggestions: ' + error);
            return;
        }
        $('#addvan-price_a-suggestion', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#addvan-price_b-suggestion', view.$element).html(Math.ceil(convertedPrices[1]));
        $('#addvan-price_c-suggestion', view.$element).html(Math.ceil(convertedPrices[2]));
    });
};

toggleLoading = function() {
    if (this.isLoading === true) {
        $('.next-btn', this.$element).html('Next <i class="fa fa-arrow-circle-right"></i>');
        this.isLoading = false;
    } else {
        $('.next-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
        this.isLoading = true;
    }
};

addVanIcons = function() {
    var view = this,
        vanClassification = App.contentClassification.data.vanClassification,
        html = '',
        vanType, i;

    for (i = 0; i < vanClassification.length; i++) {
        vanType = vanClassification[i].vanType.replace(/\s/g, ''); //Remove spaces
        html += '<div class="custom-radio">';
        html += '<input type="radio" name="van-radio" id="van-radio-' + vanClassification[i].vanType + '" value="' + vanClassification[i].vanType + '">';
        html += '<label for="van-radio-' + vanClassification[i].vanType + '">';
        html += '<div class="custom-radio-icon sg-icon icon-addvan-' + vanType.toLowerCase() + '"></div>';
        html += '<span>' + vanClassification[i].vanType + '</span>';
        html += '</label>';
        html += '</div>';
    }

    $('.vanbuttonlist-container', view.$element).append(html);
};

renderAccessories = function() {
    var view = this,
        vanClassification = App.contentClassification.data.vanClassification,
        html = '',
        vanType, i, j;

    $('#addvan-accessories', this.$element).removeClass('hidden');

    vanType = $('#addvan-form-type input[type="radio"]:checked').val();

    i = 0;
    while (i < vanClassification.length) {
        if (vanClassification[i].vanType === vanType) {
            for (j = 0; j < vanClassification[i].accessories.length; j++) {
                if (view.newVan.data.accessories !== null && view.newVan.data.accessories.indexOf(vanClassification[i].accessories[j]) > -1) {
                    html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '" checked> ' + vanClassification[i].accessories[j];
                } else {
                    html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '"> ' + vanClassification[i].accessories[j];
                }
            }
            i = vanClassification.length;
        }
        i++;
    }

    $('#addvan-accessories-container', view.$element).html(html);
};

/**
 * Prefills the form with passed data.
 */
prepopulateVan = function() {
    var van;
    if (!this.passedData || this.passedData === null) {
        return;
    }
    van = this.passedData.data;
    if (!van) {
        return;
    }
    if (van.van_type && van.van_type.length >= 0) {
        $('#dashboard-addvan-form .vanbuttonlist-container #van-radio-' + van.van_type.toLowerCase()).prop('checked', true);
        this.populateSubtypeSelect(van.van_type);
        if (van.subtype && van.subtype.length >= 0) {
            $('#van-subtype-container select').val(van.subtype);
            this.populateBrandSelect();
            if (van.brand && van.brand.length >= 0) {
                $('#van-brand-container select').val(van.brand);
            }
        }
    }
    $('#dashboard-addvan-form-model').val(van.model);
    $('#dashboard-addvan-form-description').val(van.description);
};

/**
 * @assertion: vanClassification has been loaded
 */
handleVanRadio = function(event) {
    var view = event.data;
    $('.hint1', view.$element).addClass('hidden');
    view.renderAccessories();
};

saveVan = function() {
    var view = this,
        accessoriesArray = [],
        newData;

    if (view.isLoading === true) {
        return;
    }

    //Push the checked checkboxes to an array
    Array.prototype.push.apply(accessoriesArray, $('#addvan-accessories-container input:checked', view.$element).map(function() {
        return this.name;
    }));

    //Create new van model object from form data
    newData = {
        van_type: $('#addvan-form-type .vanbuttonlist-container input[type="radio"]:checked').val(),
        model: $('#addvan-form-model').val(),
        accessories: accessoriesArray,
        description: $('#addvan-form-description').val(),
        currency: App.user.data.currency
    };

    //Validate
    if (!newData.van_type || newData.van_type === '') {
        alert('Please select a type of instrument.');
        return;
    }
    if (newData.model === '') {
        alert('Please type in the model of your instrument.');
        return;
    }

    this.toggleLoading();

    _.extend(this.newVan.data, newData);

    this.newVan.createVan(function(error) {
        if (error) {
            alert('Error saving van');
            return;
        }

        view.showPanel('#addvan-panel-photos');
        view.populatePriceSuggestions();

        view.toggleLoading();
    });

};

populatePhotos = function() {
    var images = this.newVan.data.images.split(','),
        html = '',
        i;
    for (i = 0; i < images.length; i++) {
        //Avoid empty url strings because of trailing ','
        if (images[i].length > 0) {
            html += '<li><img src="' + images[i] + '" alt="Van thumb"></li>';
        }
    }
    $('#dashboard-addvanphotos-form .thumb-list-container ul', this.$element).append(html);
};

handleImageUpload = function(event) {
    var view = event.data,
        $file = $(this);

    view.toggleLoading();

    view.newVan.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), function(error, url) {
        var $thumbList, html;
        if (error) {
            alert('Error uploading file.');
            console.log(error);
            view.toggleLoading();
            return;
        }

        $thumbList = $('#dashboard-addvanphotos-form .thumb-list-container ul', view.$element);
        html = '<li><img src="' + url + '" alt="Van thumb"></li>';
        $thumbList.append(html);

        view.toggleLoading();
    });
};

populateCountries = function($select) {
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

handlePriceChange = function() {
    var $this = $(this),
        price;
    price = parseInt($this.val(), 10);
    if (isNaN(price)) {
        price = '';
    }
    $this.val(price);
};

handleDeliveryCheckbox = function(event) {
    var view = event.data;
    if (this.checked === true) {
        view.hasDelivery = true;
        $(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled');
    } else {
        view.hasDelivery = false;
        $(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
    }
};

savePriceLocation = function() {
    var view = this,
        isLocationSame, addressOneliner, newVanData, saveCall,
        currentAddress, currentPostalCode, currentCity, currentRegion, currentCountry, didLocationChange;

    if (view.isLoading === true) {
        return;
    }

    currentAddress = this.newVan.address;
    currentPostalCode = this.newVan.postal_code;
    currentCity = this.newVan.city;
    currentRegion = this.newVan.region;
    currentCountry = this.newVan.country;
    didLocationChange = false;

    _.extend(this.newVan.data, {
        price_a: $('#dashboard-addvanprice-form #price_a', this.$element).val(),
        price_b: $('#dashboard-addvanprice-form #price_b', this.$element).val(),
        price_c: $('#dashboard-addvanprice-form #price_c', this.$element).val(),
        currency: App.user.data.currency,
        address: $('#dashboard-addvanprice-form #dashboard-addvanprice-address', this.$element).val(),
        postal_code: $('#dashboard-addvanprice-form #dashboard-addvanprice-postalcode', this.$element).val(),
        city: $('#dashboard-addvanprice-form #dashboard-addvanprice-city', this.$element).val(),
        region: $('#dashboard-addvanprice-form #dashboard-addvanprice-region', this.$element).val(),
        country: $('#dashboard-addvanprice-form #dashboard-addvanprice-country option:selected').val()
    });

    if (this.hasDelivery === true) {
        this.newVan.data.delivery_price = $('#dashboard-addvanprice-form input[name="delivery_price"]', this.$element).val();
        this.newVan.data.delivery_distance = $('#dashboard-addvanprice-form input[name="delivery_distance"]', this.$element).val();
    }

    newVanData = this.newVan.data;

    //Validation
    if (newVanData.price_a === '') {
        alert('Price is missing.');
        return;
    }
    if (newVanData.price_a % 1 !== 0) {
        alert('Hourly price is invalid.');
        return;
    }
    if (newVanData.price_b === '') {
        alert('Price is missing.');
        return;
    }
    if (newVanData.price_b % 1 !== 0) {
        alert('Daily is invalid.');
        return;
    }
    if (newVanData.price_c === '') {
        alert('Price is missing.');
        return;
    }
    if (newVanData.price_c % 1 !== 0) {
        alert('Weekly is invalid.');
        return;
    }
    if (this.hasDelivery === true && newVanData.delivery_price === '') {
        alert('Delivery price is missing.');
        return;
    }
    if (this.hasDelivery === true && newVanData.delivery_distance === '') {
        alert('Delivery distance is missing.');
        return;
    }
    if (newVanData.address === '') {
        alert('Address is missing');
        return;
    }
    if (newVanData.postal_code === '') {
        alert('Postal code is missing.');
        return;
    }
    if (newVanData.city === '') {
        alert('City is missing.');
        return;
    }
    if (newVanData.country === '' || newVanData.country === countryDefault) {
        alert('Country is missing.');
        return;
    }

    isLocationSame = (currentAddress === newVanData.address &&
        currentPostalCode === newVanData.postal_code &&
        currentCity === newVanData.city &&
        currentRegion === newVanData.region &&
        currentCountry === newVanData.country);

    view.toggleLoading();

    saveCall = function() {
        view.newVan.save(function(error) {
            view.toggleLoading();
            if (error) {
                alert('Error saving data');
                return;
            }
            view.showPanel('#addvan-panel-availability');
            if (App.user.isSubMerchant() === false) {
                view.renderSubmerchantForm();
            } else {
                view.renderAvailability();
            }

        });
    };

    if (isLocationSame === false) {
        addressOneliner = newVanData.address + ', ' + newVanData.postal_code + ' ' + newVanData.city + ', ' + newVanData.country;
        geocoder.geocode({
            'address': addressOneliner
        }, function(results, status) {
            if (status === GoogleMaps.GeocoderStatus.OK) {
                view.newVan.data.longitude = results[0].geometry.location.lng();
                view.newVan.data.latitude = results[0].geometry.location.lat();
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

renderAvailability = function() {
    var view = this,
        $calendarContainer, calendarVC, calendarVT;

    $calendarContainer = $('#addvan-availability-calendar', this.$element);
    $calendarContainer.removeClass('hidden');

    $('#addvan-darkgray-left', this.$element).hide();
    $calendarContainer.removeClass('col-sm-9');
    $calendarContainer.addClass('col-sm-12');

    calendarVC = require('./availabilitycalendar.js');
    calendarVT = require('../../templates/availabilitycalendar.html');

    view.calendarVC = new calendarVC.constructor({
        name: 'availabilitycalendar',
        $element: $calendarContainer,
        template: calendarVT,
        passedData: view.newVan
    });
    view.calendarVC.initialize();
    view.newVan.getAvailability(function(error, result) {
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

renderSubmerchantForm = function() {
    var $submerchantFormContainer = $('#addvan-availability-calendar', this.$element),
        view = this,
        submerchantFormVC, submerchantFormVT;

    submerchantFormVC = require('./submerchantregistration.js');
    submerchantFormVT = require('../../templates/submerchantregistration.html');

    view.submerchantFormVC = new submerchantFormVC.constructor({
        name: 'submerchantform',
        $element: $submerchantFormContainer,
        template: submerchantFormVT
    });
    view.submerchantFormVC.initialize();
    view.submerchantFormVC.render();
};

saveAvailability = function() {
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

    view.newVan.setAvailability(availabilityArray, alwaysFlag, function(error) {
        if (error) {
            alert('Error saving van availability.');
            console.log(error);
            return;
        }
        view.toggleLoading();
        $('.footer', view.$element).addClass('hidden');
        view.showPanel('#addvan-panel-final');
        view.setupEvent('click', '.profile-btn', view, view.handleViewVanProfile);
        view.setupEvent('click', '.addmore-btn', view, view.handleAddMoreVans);
    });
};

handleCancel = function() {
    App.router.closeModalView();
};

handleNext = function(event) {
    var view = event.data,
        currentTabID;

    currentTabID = view.getTabID();

    switch (currentTabID) {
        case 'addvan-panel-type':
            view.saveVan();
            break;
        case 'addvan-panel-photos':
            if (view.isLoading === false) {
                view.showPanel('#addvan-panel-pricelocation');
            }
            break;
        case 'addvan-panel-pricelocation':
            view.savePriceLocation();
            break;
        case 'addvan-panel-availability':
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
                });
            } else {
                view.saveAvailability();
            }
            break;
        default:
            console.log('Something went wrong.');
    }
};

handleViewVanProfile = function(event) {
    var view = event.data;
    App.router.closeModalView();
    App.router.navigateTo('vanprofile/' + view.newVan.data.id);
};

handleAddMoreVans = function() {
    App.router.closeModalView();
    App.router.openModalView('addvan');
};

showPanel = function(panelID) {
    $('.addvan-panel', this.$element).each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            $this.addClass('hidden');
        }
    });
    $(panelID, this.$element).removeClass('hidden');
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,

    getTabID: getTabID,
    toggleLoading: toggleLoading,

    addVanIcons: addVanIcons,
    renderAccessories: renderAccessories,
    prepopulateVan: prepopulateVan,
    handleVanRadio: handleVanRadio,
    saveVan: saveVan,

    populatePhotos: populatePhotos,
    handleImageUpload: handleImageUpload,

    populatePriceSuggestions: populatePriceSuggestions,

    populateCountries: populateCountries,
    handlePriceChange: handlePriceChange,
    handleDeliveryCheckbox: handleDeliveryCheckbox,
    savePriceLocation: savePriceLocation,

    renderAvailability: renderAvailability,
    renderSubmerchantForm: renderSubmerchantForm,
    saveAvailability: saveAvailability,

    handleCancel: handleCancel,
    handleNext: handleNext,
    handleViewVanProfile: handleViewVanProfile,
    handleAddMoreVans: handleAddMoreVans,

    showPanel: showPanel
});
