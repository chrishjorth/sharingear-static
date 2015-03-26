/**
 * Controller for the Sharingear Edit vans page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    GoogleMaps = require('../libraries/mscl-googlemaps.js'),
    Moment = require('moment-timezone'),

    App = require('../app.js'),
    ViewController = require('../viewcontroller.js'),
    Localization = require('../models/localization.js'),

    geocoder,

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
    handleSubmerchantFormSubmit,

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

    if (this.van.data.subtype === '') {
        $('#editvan-subtype').prop('selectedIndex', 0); // if no subtype is passed, 'Choose type:' by default
    } else {
        $('#editvan-subtype', this.$element).val(this.van.data.subtype);
    }

    if (this.van.data.brand === '') {
        $('#editvan-brand').prop('selectedIndex', 0); // if no brand is passed, 'Choose brand:' by default
    } else {
        $('#editvan-brand', this.$element).val(this.van.data.brand);
    }

    if (this.van.data.country === '') {
        $('#editvanpricingloc-form #editvanpricing-country').prop('selectedIndex', 0); // if no country is passed, 'Choose country:' by default
    } else {
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
    this.setupEvent('click', '#editvan-cancel-symbol', this, this.handleCancel);
    this.setupEvent('click', '#editvan-submerchantform-submit', this, this.handleSubmerchantFormSubmit);
};

toggleLoading = function() {
    if (this.isLoading === true) {
        $('#editvan-save-btn', this.$element).html('Save');
        this.isLoading = false;
    } else {
        $('#editvan-save-btn', this.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
        this.isLoading = true;
    }
};

populateDelivery = function() {
    var price = this.van.data.delivery_price ? this.van.data.delivery_price : '',
        distance = this.van.data.delivery_distance ? this.van.data.delivery_distance : '';

    $('#editvanpricingloc-form #delivery_price').val(price);
    $('#editvanpricingloc-form #delivery_distance').val(distance);
};

initAccessories = function() {
    var vanClassification = App.contentClassification.data.vanClassification,
        view = this,
        html = '',
        i, j;

    i = 0;
    while (i < vanClassification.length) {
        if (vanClassification[i].vanType === view.van.data.van_type) {
            for (j = 0; j < vanClassification[i].accessories.length; j++) {
                if (view.van.data.accessories !== null && view.van.data.accessories.indexOf(vanClassification[i].accessories[j]) > -1) {
                    html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '" checked> ' + vanClassification[i].accessories[j];
                } else {
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
        $calendarContainer, $submerchantFormBtn, calendarVC, calendarVT, submerchantFormVC, submerchantFormVT;

    $calendarContainer = $('#editvan-availability-calendar', this.$element);
    $calendarContainer.removeClass('hidden');

    $submerchantFormBtn = $('#editvan-submerchantform-buttons', this.$element);

    if (App.user.isSubMerchant() === true) {
        calendarVC = require('./availabilitycalendar.js');
        calendarVT = require('../../templates/availabilitycalendar.html');
        view.calendarVC = new calendarVC.constructor({
            name: 'availabilitycalendar',
            $element: $calendarContainer,
            template: calendarVT,
            passedData: {
                van: view.van
            }
        });
        view.calendarVC.initialize();
        view.calendarVC.render();
        if ($submerchantFormBtn.hasClass('hidden') === false) {
            $submerchantFormBtn.addClass('hidden');
        }
    } else {
        submerchantFormVC = require('./submerchantregistration.js');
        submerchantFormVT = require('../../templates/submerchantregistration.html');
        view.submerchantFormVC = new submerchantFormVC.constructor({
            name: 'submerchantform',
            $element: $calendarContainer,
            template: submerchantFormVT
        });
        view.submerchantFormVC.initialize();
        view.submerchantFormVC.render();
        $submerchantFormBtn.removeClass('hidden');
    }
};

handleSubmerchantFormSubmit = function(event) {
    var view = event.data,
        $button = $(this);
    $button.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
    if (view.submerchantFormVC !== null) {
        if (view.submerchantFormVC.formSubmitted === false) {
            view.submerchantFormVC.submitForm(function(error) {
                if (error) {
                    console.log('Error submitting form: ' + error);
                    return;
                }
                $button.html('Accept');
            });
        } else {
            view.submerchantFormVC.acceptTerms(function(error) {
                if (error) {
                    console.log('Error accepting terms: ' + error);
                    return;
                }
                view.renderAvailability();
            });
        }
    }
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
    for (i = 0; i < countriesArray.length; i++) {
        html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m) {
            return m.toUpperCase();
        }) + '</option>';
    }
    $select.html(html);
};

populateImages = function() {
    var images = this.van.data.images.split(','),
        html = '',
        i;
    for (i = 0; i < images.length; i++) {
        //Avoid empty url strings because of trailing ','
        if (images[i].length > 0) {
            html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
        }
    }
    $('#editvan-photos-form .thumb-list-container ul', this.$element).append(html);
};

populatePricing = function() {
    var view = this;
    Localization.convertPrices([this.van.data.price_a, this.van.data.price_b, this.van.data.price_c], this.van.data.currency, App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.log('Could not convert prices: ' + error);
            return;
        }
        $('#price_a', view.$element).val(Math.ceil(convertedPrices[0]));
        $('#price_b', view.$element).val(Math.ceil(convertedPrices[1]));
        $('#price_c', view.$element).val(Math.ceil(convertedPrices[2]));
    });
};

populatePriceSuggestions = function() {
    var vanClassification = App.contentClassification.data.vanClassification,
        view = this,
        i, suggestionA, suggestionB, suggestionC;

    for (i = 0; i < vanClassification.length; i++) {
        if (vanClassification[i].vanType === view.van.data.van_type) {
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
        $('#editvan-price_a-suggestion', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#editvan-price_b-suggestion', view.$element).html(Math.ceil(convertedPrices[1]));
        $('#editvan-price_c-suggestion', view.$element).html(Math.ceil(convertedPrices[2]));
    });
};

populateAccessories = function(event) {
    var vanClassification = App.contentClassification.data.vanClassification,
        view = event.data,
        html = '',
        vanType, i, j;

    i = 0;
    while (i < vanClassification.length) {
        if (vanClassification[i].vanType === vanType) {
            for (j = 0; j < vanClassification[i].accessories.length; j++) {
                if (view.van.data.accessories !== null && view.van.data.accessories.indexOf(vanClassification[i].accessories[j]) > -1) {
                    html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '" checked> ' + vanClassification[i].accessories[j];
                } else {
                    html += '<input type="checkbox" name="' + vanClassification[i].accessories[j] + '" value="' + vanClassification[i].accessories[j] + '"> ' + vanClassification[i].accessories[j];
                }
            }
            i = vanClassification.length;
        }
        i++;
    }

    $('#editvan-accessories-container', view.$element).html(html);
};

handleDeliveryCheckbox = function() {
    if (this.checked === true) {
        $(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled');
    } else {
        $(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
    }
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

handleCancel = function() {
    var currentVerticalPosition = $(window).scrollTop();
    App.router.closeModalView();
    $('body, html').animate({
        scrollTop: currentVerticalPosition
    }, 50);
};

handleImageUpload = function(event) {
    var view = event.data,
        $file = $(this);

    view.toggleLoading();

    view.van.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), function(error, url) {
        var $thumbList, html;
        $('#editvan-form-imageupload').val('');
        if (error) {
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

    if (view.isLoading === true) {
        return;
    }

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

        view.van.setAvailability(availabilityArray, alwaysFlag, function(error) {
            if (error) {
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
    if (parseFloat($('#price_a', this.$element).val()) % 1 !== 0) {
        alert('The hourly rental price is invalid.');
        view.toggleLoading();
        return;
    }
    if ($('#price_b', this.$element).val() === '') {
        alert('The rental price field is required.');
        view.toggleLoading();
        return;
    }
    if (parseFloat($('#price_b', this.$element).val()) % 1 !== 0) {
        alert('The daily rental price is invalid.');
        view.toggleLoading();
        return;
    }
    if ($('#price_c', this.$element).val() === '') {
        alert('The rental price field is required.');
        view.toggleLoading();
        return;
    }
    if (parseFloat($('#price_c', this.$element).val()) % 1 !== 0) {
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
            if (error) {
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

    if (isLocationSame === false) {
        addressOneliner = updatedVanData.address + ', ' + updatedVanData.postal_code + ' ' + updatedVanData.city + ', ' + updatedVanData.country;
        geocoder.geocode({
            'address': addressOneliner
        }, function(results, status) {
            if (status === GoogleMaps.GeocoderStatus.OK) {
                view.van.data.longitude = results[0].geometry.location.lng();
                view.van.data.latitude = results[0].geometry.location.lat();
                updateCall();
            } else {
                alert('Google Maps could not find your address. Please verify that it is correct.');
                view.toggleLoading();
            }
        });
    } else {
        updateCall();
    }
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,

    toggleLoading: toggleLoading,

    populateBrandSelect: populateBrandSelect,
    populateSubtypeSelect: populateSubtypeSelect,
    populateAccessories: populateAccessories,
    handleSubtypeChange: handleSubtypeChange,

    populateImages: populateImages,
    handleImageUpload: handleImageUpload,

    populateLocation: populateLocation,
    populateCountries: populateCountries,
    populateDelivery: populateDelivery,
    handleDeliveryCheckbox: handleDeliveryCheckbox,
    handlePriceChange: handlePriceChange,

    initAccessories: initAccessories,
    renderAvailability: renderAvailability,
    handleSubmerchantFormSubmit: handleSubmerchantFormSubmit,

    populatePricing: populatePricing,
    populatePriceSuggestions: populatePriceSuggestions,

    handleCancel: handleCancel,
    handleSave: handleSave
});
