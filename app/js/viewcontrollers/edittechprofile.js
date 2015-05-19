/**
 * Controller for the Sharingear Edit tech profile page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    GoogleMaps = require('../libraries/mscl-googlemaps.js'),
    Moment = require('moment-timezone'),

    Config = require('../config.js'),
    App = require('../app.js'),
    ViewController = require('../viewcontroller.js'),
    Localization = require('../models/localization.js'),
    ContentClassification = require('../models/contentclassification.js');

function EditTechProfile(options) {
    ViewController.call(this, options);
}

EditTechProfile.prototype = new ViewController();

EditTechProfile.prototype.didInitialize = function() {
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

    this.geocoder = new GoogleMaps.Geocoder();

    this.setTitle('Sharingear - Edit technician profile');
    this.setDescription('Edit experience, price, location and availability of your technician profile and upload photos.');
};

EditTechProfile.prototype.didRender = function() {
    this.populateExperience();
    this.populateCountries($('#edittechprofilepricing-country', this.$element));
    this.populateLocation();
    this.renderAvailability();

    if (this.techProfile.data.subtype === '') {
        $('#edittechprofile-subtype').prop('selectedIndex', 0); // if no subtype is passed, 'Choose type:' by default
    } else {
        $('#edittechprofile-subtype', this.$element).val(this.techProfile.data.subtype);
    }

    if (this.techProfile.data.brand === '') {
        $('#edittechprofile-brand').prop('selectedIndex', 0); // if no brand is passed, 'Choose brand:' by default
    } else {
        $('#edittechprofile-brand', this.$element).val(this.techProfile.data.brand);
    }

    if (this.techProfile.data.country === '') {
        $('#edittechprofilepricing-country').prop('selectedIndex', 0); // if no country is passed, 'Choose country:' by default
    } else {
        $('#edittechprofilepricing-country', this.$element).val(this.techProfile.data.country);
    }

    this.populatePricing();
    this.populatePriceSuggestions();

    this.setupEvent('click', '#edittechprofile-cancel-btn', this, this.handleCancel);
    this.setupEvent('click', '#edittechprofile-save-btn', this, this.handleSave);
    this.setupEvent('change', '#edittechprofile-photos-form-imageupload', this, this.handleImageUpload);
    this.setupEvent('change', '.price', this, this.handlePriceChange);
    this.setupEvent('click', '#edittechprofile-cancel-symbol', this, this.handleCancel);

    this.setupEvent('click', '#edittechprofile-startyear', this, this.handleExperienceStartYearChange);

    this.setupEvent('click', '#edittechprofile-submerchantform-submit', this, this.handleSubmerchantFormSubmit);
};

EditTechProfile.prototype.toggleLoading = function() {
    if (this.isLoading === true) {
        $('#edittechprofile-save-btn', this.$element).html('Save');
        this.isLoading = false;
    } else {
        $('#edittechprofile-save-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
        this.isLoading = true;
    }
};

EditTechProfile.prototype.renderAvailability = function() {
    var view = this,
        $calendarContainer, $submerchantFormBtn, CalendarVC, calendarVT, SubmerchantFormVC, submerchantFormVT;

    $calendarContainer = $('#edittechprofile-availability-calendar', this.$element);
    $calendarContainer.removeClass('hidden');

    $submerchantFormBtn = $('#edittechprofile-submerchantform-buttons', this.$element);

    if (App.user.isSubMerchant() === true) {
        CalendarVC = require('./availabilitycalendar.js');
        calendarVT = require('../../templates/availabilitycalendar.html');
        view.calendarVC = new CalendarVC({
            name: 'availabilitycalendar',
            $element: $calendarContainer,
            template: calendarVT,
            passedData: {
                technician: view.techProfile
            }
        });
        view.calendarVC.initialize();
        view.calendarVC.render();
        if ($submerchantFormBtn.hasClass('hidden') === false) {
            $submerchantFormBtn.addClass('hidden');
        }
    } else {
        SubmerchantFormVC = require('./submerchantregistration.js');
        submerchantFormVT = require('../../templates/submerchantregistration.html');
        view.submerchantFormVC = new SubmerchantFormVC({
            name: 'submerchantform',
            $element: $calendarContainer,
            template: submerchantFormVT
        });
        view.submerchantFormVC.initialize();
        view.submerchantFormVC.render();
        $submerchantFormBtn.removeClass('hidden');
    }
};

EditTechProfile.prototype.handleSubmerchantFormSubmit = function(event) {
    var view = event.data,
        $button = $(this);
    $button.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
    if (view.submerchantFormVC.formSubmitted === false) {
        view.submerchantFormVC.submitForm(function(error) {
            $button.html('Submit');
            if (!error) {
                view.renderAvailability();
            }
        });
    }
};

EditTechProfile.prototype.populateExperience = function() {
    var xp_years = this.techProfile.data.xp_years.split('-'),
        level = 5;
    switch (this.techProfile.data.experience) {
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
    if (xp_years[0]) {
        $('#edittechprofile-startyear', this.$element).val(xp_years[0]);
    } else {
        $('#edittechprofile-startyear', this.$element).val('-');
    }
    if (xp_years[1]) {
        $('#edittechprofile-endyear', this.$element).val(xp_years[1]);
    } else {
        $('#edittechprofile-endyear', this.$element).val('-');
    }
};

EditTechProfile.prototype.populateYearsOfExperience = function() {
    var $startYear = $('#edittechprofile-startyear', this.$element),
        $endYear = $('#edittechprofile-endyear', this.$element),
        startYearSelectHTML = '',
        endYearSelectHTML = '',
        currentYear = (new Moment.tz(Localization.getCurrentTimeZone())).year(),
        startYear, endYear, i;

    startYear = $startYear.val();
    if (startYear === null) {
        startYear = Config.MIN_XP_START_YEAR;
    }
    endYear = $endYear.val();
    if (endYear === null) {
        endYear = currentYear;
    }
    if (endYear < startYear) {
        endYear = startYear;
    }
    startYearSelectHTML += '<option value="-">start year</option>';
    endYearSelectHTML += '<option value="-">end year</option>';
    for (i = Config.MIN_XP_START_YEAR; i < startYear; i++) {
        startYearSelectHTML += '<option value="' + i + '">' + i + '</option>';
    }
    for (i = startYear; i <= currentYear; i++) {
        startYearSelectHTML += '<option value="' + i + '">' + i + '</option>';
        endYearSelectHTML += '<option value="' + i + '">' + i + '</option>';
    }
    $startYear.html(startYearSelectHTML);
    $startYear.val(startYear);
    $endYear.html(endYearSelectHTML);
    $endYear.val(endYear);
};

EditTechProfile.prototype.handleExperienceStartYearChange = function(event) {
    var view = event.data;
    view.populateYearsOfExperience();
};

EditTechProfile.prototype.populateLocation = function() {
    $('#edittechprofilepricing-city', this.$element).val(this.techProfile.data.city);
    $('#edittechprofilepricing-address', this.$element).val(this.techProfile.data.address);
    $('#edittechprofilepricing-postalcode', this.$element).val(this.techProfile.data.postal_code);
    $('#edittechprofilepricing-region', this.$element).val(this.techProfile.data.region);
};

EditTechProfile.prototype.populateCountries = function($select) {
    var countriesArray = Localization.getCountries(),
        html = $('option', $select).first()[0].outerHTML,
        i;
    for (i = 0; i < countriesArray.length; i++) {
        html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m) {
            return m.toUpperCase();
        }) + '</option>';
    }
    $select.html(html);
};

EditTechProfile.prototype.populatePricing = function() {
    var view = this;
    Localization.convertPrices([this.techProfile.data.price_a, this.techProfile.data.price_b, this.techProfile.data.price_c], this.techProfile.data.currency, App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.error('Could not convert prices: ' + error);
            return;
        }
        $('#price_a', view.$element).val(Math.ceil(convertedPrices[0]));
        $('#price_b', view.$element).val(Math.ceil(convertedPrices[1]));
        $('#price_c', view.$element).val(Math.ceil(convertedPrices[2]));
    });
};

EditTechProfile.prototype.populatePriceSuggestions = function() {
    var techProfileClassification = ContentClassification.data.roadieClassification,
        view = this,
        i, suggestionA, suggestionB, suggestionC;

    for (i = 0; i < techProfileClassification.length; i++) {
        if (techProfileClassification[i].roadie_type === view.techProfile.data.roadie_type) {
            suggestionA = techProfileClassification[i].price_a_suggestion;
            suggestionB = techProfileClassification[i].price_b_suggestion;
            suggestionC = techProfileClassification[i].price_c_suggestion;
            i = techProfileClassification.length;
        }
    }
    Localization.convertPrices([suggestionA, suggestionB, suggestionC], 'EUR', App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.error('Could not convert price suggestions: ' + error);
            return;
        }
        $('#edittechprofile-price_a-suggestion', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#edittechprofile-price_b-suggestion', view.$element).html(Math.ceil(convertedPrices[1]));
        $('#edittechprofile-price_c-suggestion', view.$element).html(Math.ceil(convertedPrices[2]));
    });
};

EditTechProfile.prototype.handlePriceChange = function() {
    var $this = $(this),
        price;
    price = parseInt($this.val(), 10);
    if (isNaN(price)) {
        price = '';
    }
    $this.val(price);
};

EditTechProfile.prototype.handleCancel = function() {
    var currentVerticalPosition = $(window).scrollTop();
    App.router.closeModalView();
    $('body, html').animate({
        scrollTop: currentVerticalPosition
    }, 50);
};

EditTechProfile.prototype.handleSave = function(event) {
    var view = event.data,
        isLocationSame = false,
        currentAddress = view.techProfile.data.address,
        currentPostalCode = view.techProfile.data.postal_code,
        currentCity = view.techProfile.data.city,
        currentRegion = view.techProfile.data.region,
        currentCountry = view.techProfile.data.country,
        availabilityArray = [],
        selections, alwaysFlag, updatedVanData, addressOneliner, updateCall, month, monthSelections, selection, j,
        techProfileData, address, postal_code, city;

    if (view.isLoading === true) {
        return;
    }

    if (GoogleMaps.isLoaded() === false) {
        setTimeout(function() {
            view.handleSave(event);
        }, 10);
        return;
    }

    view.geocoder = new GoogleMaps.Geocoder();

    view.toggleLoading();

    //If user has not registered as submerchant, the calendar view is not loaded
    if (view.calendarVC && view.calendarVC !== null) {
        selections = view.calendarVC.getSelections();
        alwaysFlag = view.calendarVC.getAlwaysFlag();

        //Convert selections to availability array
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

        view.techProfile.setAvailability(availabilityArray, alwaysFlag, function(error) {
            if (error) {
                alert('Error saving availability.');
                console.error(error);
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

    techProfileData = view.techProfile.data;

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
    if (parseFloat($('#price_a', this.$element).val()) % 1 !== 0) {
        alert('The daily rental price is invalid.');
        view.toggleLoading();
        return;
    }
    if ($('#price_b', this.$element).val() === '') {
        alert('The rental price field is required.');
        view.toggleLoading();
        return;
    }
    if (parseFloat($('#price_b', this.$element).val()) % 1 !== 0) {
        alert('The weekly rental price is invalid.');
        view.toggleLoading();
        return;
    }
    if ($('#price_c', this.$element).val() === '') {
        alert('The rental price field is required.');
        view.toggleLoading();
        return;
    }
    if (parseFloat($('#price_c', this.$element).val()) % 1 !== 0) {
        alert('The monthly rental price is invalid.');
        view.toggleLoading();
        return;
    }
    address = $('#edittechprofilepricing-address', this.$element).val();
    if (address === '' && address !== techProfileData.address) {
        alert('The address field is required.');
        view.toggleLoading();
        return;
    }
    postal_code = $('#edittechprofilepricing-postalcode', this.$element).val();
    if (postal_code === '' && postal_code !== techProfileData.postal_code) {
        alert('The postalcode field is required.');
        view.toggleLoading();
        return;
    }
    city = $('#edittechprofilepricing-city', this.$element).val();
    if (city === '' && city !== techProfileData.city) {
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
            if (error) {
                alert('Error updating technician profile.');
                console.error(error);
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

    if (isLocationSame === false) {
        addressOneliner = updatedVanData.address + ', ' + updatedVanData.postal_code + ' ' + updatedVanData.city + ', ' + updatedVanData.country;
        view.geocoder.geocode({
            'address': addressOneliner
        }, function(results, status) {
            if (status === GoogleMaps.GeocoderStatus.OK) {
                view.techProfile.data.longitude = results[0].geometry.location.lng();
                view.techProfile.data.latitude = results[0].geometry.location.lat();
            }
            updateCall();
        });
    } else {
        updateCall();
    }
};

module.exports = EditTechProfile;
