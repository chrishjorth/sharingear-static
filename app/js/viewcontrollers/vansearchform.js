/**
 * Controller for the Sharingear Search form.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    GoogleMaps = require('../libraries/mscl-googlemaps.js'),
    Moment = require('moment-timezone'),

    Utilities = require('../utilities.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    Localization = require('../models/localization.js'),
    ContentClassification = require('../models/contentclassification.js'),

    numberOfGearSuggestions = 5;

function VanSearchForm(options) {
    ViewController.call(this, options);
}

VanSearchForm.prototype = new ViewController();

VanSearchForm.prototype.didInitialize = function() {
    this.vanSelectionIndex = 0;
    this.vanInputString = '';
    this.vanSuggestionsArray = []; // array of strings
    this.didSearchBefore = false;
    this.calendarVC = null;
};

VanSearchForm.prototype.didRender = function() {
    var view = this,
        $searchPickup, $searchReturn;

    $searchPickup = $('#vansearch-pickup', view.$element);
    $searchReturn = $('#vansearch-return', view.$element);

    this.loadLocationAutoComplete();

    this.prefillForm();

    this.setupEvent('click', '#vansearch-pickup', this, this.handlePickupDate);
    this.setupEvent('click', '#vansearch-return', this, this.handleDeliveryDate);
    this.setupEvent('submit', '#vansearchform-form', this, this.handleSearch);
    this.setupEvent('input', '#vansearch-van', this, view.showVanSuggestions);
    this.setupEvent('keydown', '#vansearch-van', this, view.vanInputArrowKeypress);
    this.setupEvent('focusout', '#vansearch-van', this, view.searchVanLoseFocus);
    this.setupEvent('focusin', '#vansearch-van', this, view.searchVanGainFocus);
    this.setupEvent('mousedown touchstart', '.suggestion', this, view.setVanSuggestion);
};

VanSearchForm.prototype.loadLocationAutoComplete = function() {
    if (GoogleMaps.isLoaded() === false) {
        setTimeout(this.loadLocationAutoComplete, 10);
        return;
    }

    new GoogleMaps.places.Autocomplete($('#vansearch-location', this.$element)[0], {
        types: ['geocode']
    });
};

VanSearchForm.prototype.prefillForm = function() {
    var view = this,
        $searchPickup, $searchReturn,
        queryString, previousSearchVan, previousSearchLocation, previousSearchDateRange, startDate, endDate;

    $searchPickup = $('#vansearch-pickup', view.$element);
    $searchReturn = $('#vansearch-return', view.$element);

    if (App.user && App.user.data.currentCity !== null && App.user.data.currentCity !== '') {
        $('#vansearch-location', view.$element).attr('placeholder', App.user.data.currentCity);
    }

    startDate = new Moment.tz(Localization.getCurrentTimeZone());
    endDate = new Moment.tz(startDate, Localization.getCurrentTimeZone());
    endDate.add(1, 'days');

    queryString = Utilities.getQueryString();
    if (queryString) {
        previousSearchVan = Utilities.getQueryStringParameterValue(queryString, 'van');
        previousSearchLocation = Utilities.getQueryStringParameterValue(queryString, 'location');
        previousSearchDateRange = Utilities.getQueryStringParameterValue(queryString, 'daterange');
        if (previousSearchDateRange && previousSearchDateRange !== null) {
            previousSearchDateRange = previousSearchDateRange.split('-');
            $('#vansearch-van', this.$element).val(previousSearchVan);
            $('#vansearch-location', this.$element).val(previousSearchLocation);
            startDate = new Moment.tz(previousSearchDateRange[0], 'YYYYMMDD', Localization.getCurrentTimeZone());
            endDate = new Moment.tz(previousSearchDateRange[1], 'YYYYMMDD', Localization.getCurrentTimeZone());
        }
    }
    $searchPickup.val(startDate.format('DD/MM/YYYY'));
    $searchReturn.val(endDate.format('DD/MM/YYYY'));
};

VanSearchForm.prototype.handlePickupDate = function(event) {
    var view = event.data,
        passedData, pickupInputString, deliveryInputString;

    $(this).blur();

    passedData = {
        pickupActive: true,
        parent: view
    };

    pickupInputString = $('#vansearch-pickup', view.$element).val();
    if (pickupInputString !== '') {
        passedData.pickupDate = new Moment.tz(pickupInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }
    deliveryInputString = $('#search-return', view.$element).val();
    if (deliveryInputString !== '') {
        passedData.deliveryDate = new Moment.tz(deliveryInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }

    App.router.openModalView('pickupdeliverycalendar', passedData);
};

VanSearchForm.prototype.handleDeliveryDate = function(event) {
    var view = event.data,
        passedData, pickupInputString, deliveryInputString;

    $(this).blur();

    passedData = {
        pickupActive: false,
        parent: view
    };

    pickupInputString = $('#vansearch-pickup', view.$element).val();
    if (pickupInputString !== '') {
        passedData.pickupDate = new Moment.tz(pickupInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }

    deliveryInputString = $('#vansearch-return', view.$element).val();
    if (deliveryInputString !== '') {
        passedData.deliveryDate = new Moment.tz(deliveryInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }

    App.router.openModalView('pickupdeliverycalendar', passedData);
};

VanSearchForm.prototype.handlePickupSelection = function(vc, callback) {
    $('#vansearch-pickup', this.$element).val(vc.pickupDate.format('DD/MM/YYYY'));
    this.deliveryDateConfirmed = false;
    if (_.isFunction(callback) === true) {
        callback();
    }
};

VanSearchForm.prototype.handleDeliverySelection = function(vc, callback) {
    $('#vansearch-return', this.$element).val(vc.deliveryDate.format('DD/MM/YYYY'));
    if (this.deliveryDateConfirmed === true) {
        App.router.closeModalView();
    }
    this.deliveryDateConfirmed = true; //next time the user selects delivery we close the calendar

    if (Utilities.isMobile() === true) {
        this.handleSearch({
            data: this
        });
    }

    if (_.isFunction(callback) === true) {
        callback();
    }
};

/**
 * Displays search results from the model.
 * @param event: jQuery event object
 * @param callback: callback function
 * @return Always false to avoid triggering HTML form
 */
VanSearchForm.prototype.handleSearch = function(event) {
    var view = event.data,
        searchParams, queryString;

    searchParams = view.getSearchParameters();
    queryString = 'location=' + encodeURIComponent(searchParams.locationString) + '&van=' + encodeURIComponent(searchParams.vanString) + '&daterange=' + searchParams.dateRangeString;
    App.router.setQueryString(queryString);
    if (App.router.currentViewController.name === 'search') {
        App.router.currentViewController.performVanSearch(searchParams.vanString, searchParams.locationString, searchParams.dateRangeString);
    } else {
        App.router.navigateTo('search');
    }
    return false;
};

VanSearchForm.prototype.showVanSuggestions = function(event) {
    var view = event.data,
        $searchVan = $('#vansearch-van', view.$element),
        searchString, vanClassificationList, classificationSuggestions;

    searchString = $searchVan.val();
    if (view.vanSelectionIndex === 0) {
        view.vanInputString = searchString; // save the input string when nothing is selected
    }
    // reset selection if new input was added since we saved the gearinputstring
    if (view.vanInputString !== searchString) {
        view.vanSelectionIndex = 0;
        view.vanInputString = searchString;
    }

    searchString = searchString.toLowerCase().trim();

    vanClassificationList = ContentClassification.data.vanClassification;
    classificationSuggestions = _.filter(vanClassificationList, function(van) {
        var typeName = van.vanType.toLowerCase();
        return typeName.indexOf(searchString) >= 0;
    });
    classificationSuggestions = _.map(classificationSuggestions, function(van) {
        return van.vanType;
    });

    view.vanSuggestionsArray = _.first(classificationSuggestions, numberOfGearSuggestions);
    view.drawVanSuggestions();
};

VanSearchForm.prototype.drawVanSuggestions = function() {
    var view = this,
        $vansSuggestionBox = $('#vans-suggestions-box', view.$element),
        $searchField, suggestions, i, html, j;

    $vansSuggestionBox.html('');
    // hides or styles box
    if (view.vanInputString.length === 0) {
        $vansSuggestionBox.addClass('hidden');
        return;
    }

    $vansSuggestionBox.removeClass('hidden');

    $searchField = $('#vansearch-van', view.$element);
    $vansSuggestionBox.css({
        'position': 'absolute',
        'width': $searchField.outerWidth(),
        'left': $searchField.position().left,
        'top': $searchField.position().top + $searchField.outerHeight()
    });

    suggestions = view.vanSuggestionsArray;

    for (i = 0; i < numberOfGearSuggestions; i++) {
        if (suggestions.length > i) {
            html = '<div class="suggestion">';
            html += '<span class="suggestion-icon"></span>';
            // parse string and check if any substring is equal to any part of view.gearInputString separated by " "
            // if so, write it in bold, else write characters 
            j = 0;
            while (j < suggestions[i].length) {
                // if view.gearInputString is here at suggestions[i][j]
                if (suggestions[i].toLowerCase().indexOf(view.vanInputString) == j && (j < 1 || suggestions[i][j - 1] == ' ')) {
                    html += '<span class="suggestion-bold">';
                    html += suggestions[i].substring(j, j + view.vanInputString.length);
                    html += '</span>';
                    j += view.vanInputString.length;
                } else {
                    html += suggestions[i][j];
                    j++;
                }
            }
            html += '</div>';
            $vansSuggestionBox.append(html);
        }
    }
};

VanSearchForm.prototype.vanInputArrowKeypress = function(event) {
    var view = event.data,
        $searchVan,
        possibleSelections, i;

    $searchVan = $('#vansearch-van', view.$element);

    if (event.which !== 38 && event.which !== 40) {
        return;
    }

    possibleSelections = $('#vans-suggestions-box > div');

    // arrow keys codes: right, up, left, down  =  39 38 37 40
    if (event.which == 38) { // up
        view.vanSelectionIndex--;
    } else if (event.which == 40) {
        view.vanSelectionIndex++;
    }

    if (view.vanSelectionIndex > possibleSelections.length) { // clamp
        view.vanSelectionIndex = 0;
    } else if (view.vanSelectionIndex < 0) {
        view.vanSelectionIndex = possibleSelections.length;
    }
    // set classes for selected.
    for (i = 0; i < possibleSelections.length; i++) {
        $(possibleSelections[i]).removeClass('suggestion-selected');
        if (i + 1 == view.gearSelectionIndex) { // gearSelectionIndex is 0 when not selected.
            $(possibleSelections[i]).addClass('suggestion-selected');
        }
    }

    if (view.vanSelectionIndex !== 0) {
        // set input text to the value of the selection
        $searchVan.val($('.suggestion-selected').text());
    } else {
        // set input text back to old input value
        $searchVan.val(view.vanInputString);
    }

    $searchVan.focus();
    $searchVan.val($searchVan.val());

    // prevents input field to set caret to start position.
    return false;
};

VanSearchForm.prototype.searchVanLoseFocus = function(event) {
    var view = event.data;
    // clears suggestion box when losing focus
    $('#vans-suggestions-box', view.$element).hide();
};

VanSearchForm.prototype.searchVanGainFocus = function(event) {
    var view = event.data;
    $('#vans-suggestions-box', view.$element).show();
};

VanSearchForm.prototype.setVanSuggestion = function(event) {
    var view = event.data;
    $('#vansearch-van', view.$element).val($(event.target).text());
    $('#vans-suggestions-box', view.$element).hide();
};

VanSearchForm.prototype.getSearchParameters = function() {
    var view = this,
        $locationContainer,
        location, searchString, dateRange, pickupDate, returnDate, searchParameters;

    // remove gear suggestion dropdown when submitting
    $('#vans-suggestions-box', view.$element).hide();

    $locationContainer = $('#vansearch-location', view.$element);
    location = $locationContainer.val();
    if (location === '') {
        location = $locationContainer.attr('placeholder');
    }

    //URI playground
    //dateRange = '20140828-20140901';
    pickupDate = new Moment.tz($('#vansearch-pickup', view.$element).val(), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    returnDate = new Moment.tz($('#vansearch-return', view.$element).val(), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    dateRange = pickupDate.format('YYYYMMDD') + '-' + returnDate.format('YYYYMMDD');
    searchString = $('#vansearch-van', this.$element).val();

    searchParameters = {
        vanString: searchString,
        locationString: location,
        dateRangeString: dateRange
    };
    return searchParameters;
};

module.exports = VanSearchForm;
