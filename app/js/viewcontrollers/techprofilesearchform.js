/**
 * Controller for the Sharingear Search form.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
	$ = require('jquery'),
	GoogleMaps = require('googlemaps'),
	Moment = require('moment-timezone'),

	Utilities = require('../utilities.js'),
	ViewController = require('../viewcontroller.js'),
	App = require('../app.js'),

	Localization = require('../models/localization.js'),

	numberOfTechProfileSuggestions = 5,
    geocoder,

    didInitialize,
    didRender,
    prefillForm,

    handlePickupDate,
    handleDeliveryDate,
    handlePickupSelection,
    handleDeliverySelection,

    handleSearch,
    showTechProfileSuggestions,
    drawTechProfileSuggestions,
    techProfileInputArrowKeypress,
    searchTechProfileLoseFocus,
    searchTechProfileGainFocus,
    setTechProfileSuggestion,

    getSearchParameters;

//Static variables
geocoder = new GoogleMaps.Geocoder();

didInitialize = function() {
    this.techProfileSelectionIndex = 0;
    this.techProfileInputString = '';
    this.techProfileSuggestionsArray = []; // array of strings
    this.didSearchBefore = false;
    this.calendarVC = null;
};

didRender = function() {
    var view = this,
        $searchPickup, $searchReturn;

    $searchPickup = $('#techprofilesearch-pickup', view.$element);
    $searchReturn = $('#techprofilesearch-return', view.$element);

    new GoogleMaps.places.Autocomplete($('#techprofilesearch-location', view.$element)[0], {
        types: ['geocode']
    });

    this.prefillForm();

    this.setupEvent('click', '#techprofilesearch-pickup', this, this.handlePickupDate);
    this.setupEvent('click', '#techprofilesearch-return', this, this.handleDeliveryDate);
    this.setupEvent('submit', '#techprofilesearchform-form', this, this.handleSearch);
    this.setupEvent('input', '#techprofilesearch-techprofile', this, view.showTechProfileSuggestions);
    this.setupEvent('keydown', '#techprofilesearch-techprofile', this, view.techProfileInputArrowKeypress);
    this.setupEvent('focusout', '#techprofilesearch-techprofile', this, view.searchTechProfileLoseFocus);
    this.setupEvent('focusin', '#techprofilesearch-techprofile', this, view.searchTechProfileGainFocus);
    this.setupEvent('mousedown touchstart', '.suggestion', this, view.setTechProfileSuggestion);
};

prefillForm = function() {
    var view = this,
        $searchPickup, $searchReturn,
        queryString, previousSearchVan, previousSearchLocation, previousSearchDateRange, startDate, endDate;

    $searchPickup = $('#techprofilesearch-pickup', view.$element);
    $searchReturn = $('#techprofilesearch-return', view.$element);

    if (App.user.data && App.user.data.currentCity !== null && App.user.data.currentCity !== '') {
        $('#techprofilesearch-location', view.$element).attr('placeholder', App.user.data.currentCity);
    }

    startDate = new Moment.tz(Localization.getCurrentTimeZone());
    endDate = new Moment.tz(startDate, Localization.getCurrentTimeZone());
    endDate.add(1, 'days');

    queryString = Utilities.getQueryString();
    if (queryString) {
        previousSearchVan = Utilities.getQueryStringParameterValue(queryString, 'techprofile');
        previousSearchLocation = Utilities.getQueryStringParameterValue(queryString, 'location');
        previousSearchDateRange = Utilities.getQueryStringParameterValue(queryString, 'daterange');
        if (previousSearchDateRange && previousSearchDateRange !== null) {
            previousSearchDateRange = previousSearchDateRange.split('-');
            $('#techprofilesearch-techprofile', this.$element).val(previousSearchVan);
            $('#techprofilesearch-location', this.$element).val(previousSearchLocation);
            startDate = new Moment.tz(previousSearchDateRange[0], 'YYYYMMDD', Localization.getCurrentTimeZone());
            endDate = new Moment.tz(previousSearchDateRange[1], 'YYYYMMDD', Localization.getCurrentTimeZone());
        }
    }
    $searchPickup.val(startDate.format('DD/MM/YYYY'));
    $searchReturn.val(endDate.format('DD/MM/YYYY'));
};

handlePickupDate = function(event) {
    var view = event.data,
        passedData, pickupInputString, deliveryInputString;

    $(this).blur();

    passedData = {
        pickupActive: true,
        parent: view
    };

    pickupInputString = $('#techprofilesearch-pickup', view.$element).val();
    if (pickupInputString !== '') {
        passedData.pickupDate = new Moment.tz(pickupInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }
    deliveryInputString = $('#search-return', view.$element).val();
    if (deliveryInputString !== '') {
        passedData.deliveryDate = new Moment.tz(deliveryInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }

    App.router.openModalView('pickupdeliverycalendar', passedData);
};

handleDeliveryDate = function(event) {
    var view = event.data,
        passedData, pickupInputString, deliveryInputString;

    $(this).blur();

    passedData = {
        pickupActive: false,
        parent: view
    };

    pickupInputString = $('#techprofilesearch-pickup', view.$element).val();
    if (pickupInputString !== '') {
        passedData.pickupDate = new Moment.tz(pickupInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }

    deliveryInputString = $('#techprofilesearch-return', view.$element).val();
    if (deliveryInputString !== '') {
        passedData.deliveryDate = new Moment.tz(deliveryInputString, 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    }

    App.router.openModalView('pickupdeliverycalendar', passedData);
};

handlePickupSelection = function(vc, callback) {
    $('#techprofilesearch-pickup', this.$element).val(vc.pickupDate.format('DD/MM/YYYY'));
    this.deliveryDateConfirmed = false;
    if (_.isFunction(callback) === true) {
        callback();
    }
};

handleDeliverySelection = function(vc, callback) {
    $('#techprofilesearch-return', this.$element).val(vc.deliveryDate.format('DD/MM/YYYY'));
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
handleSearch = function(event) {
    var view = event.data,
        searchParams, queryString;

    searchParams = view.getSearchParameters();
    queryString = 'location=' + encodeURIComponent(searchParams.locationString) + '&techprofile=' + encodeURIComponent(searchParams.techProfileString) + '&daterange=' + searchParams.dateRangeString;
    App.router.setQueryString(queryString);
    if (App.router.currentViewController.name === 'search') {
        App.router.currentViewController.performTechProfileSearch(searchParams.techProfileString, searchParams.locationString, searchParams.dateRangeString);
    } else {
        App.router.navigateTo('search');
    }
    return false;
};

showTechProfileSuggestions = function(event) {
    var view = event.data,
        $searchTechProfile = $('#techprofilesearch-techprofile', view.$element),
        searchString, techProfileClassificationList, classificationSuggestions;

    searchString = $searchTechProfile.val();
    if (view.techProfileSelectionIndex === 0) {
        view.techProfileInputString = searchString; // save the input string when nothing is selected
    }
    // reset selection if new input was added since we saved the gearinputstring
    if (view.techProfileInputString !== searchString) {
        view.techProfileSelectionIndex = 0;
        view.techProfileInputString = searchString;
    }

    searchString = searchString.toLowerCase().trim();

    techProfileClassificationList = App.contentClassification.data.roadieClassification;
    classificationSuggestions = _.filter(techProfileClassificationList, function(techProfile) {
        var typeName = techProfile.roadie_type.toLowerCase();
        return typeName.indexOf(searchString) >= 0;
    });
    classificationSuggestions = _.map(classificationSuggestions, function(techProfile) {
        return techProfile.roadie_type;
    });

    view.techProfileSuggestionsArray = _.first(classificationSuggestions, numberOfTechProfileSuggestions);
    view.drawTechProfileSuggestions();
};

drawTechProfileSuggestions = function() {
    var view = this,
        $techProfilesSuggestionBox = $('#techprofiles-suggestions-box', view.$element),
        $searchField, suggestions, i, html, j;

    $techProfilesSuggestionBox.html('');
    // hides or styles box
    if (view.techProfileInputString.length === 0) {
        $techProfilesSuggestionBox.addClass('hidden');
        return;
    }

    $techProfilesSuggestionBox.removeClass('hidden');

    $searchField = $('#techprofilesearch-techprofile', view.$element);
    $techProfilesSuggestionBox.css({
        'position': 'absolute',
        'width': $searchField.outerWidth(),
        'left': $searchField.position().left,
        'top': $searchField.position().top + $searchField.outerHeight()
    });

    suggestions = view.techProfileSuggestionsArray;

    for (i = 0; i < numberOfTechProfileSuggestions; i++) {
        if (suggestions.length > i) {
            html = '<div class="suggestion">';
            html += '<span class="suggestion-icon"></span>';
            // parse string and check if any substring is equal to any part of view.gearInputString separated by " "
            // if so, write it in bold, else write characters 
            j = 0;
            while (j < suggestions[i].length) {
                // if view.gearInputString is here at suggestions[i][j]
                if (suggestions[i].toLowerCase().indexOf(view.techProfileInputString) == j && (j < 1 || suggestions[i][j - 1] == ' ')) {
                    html += '<span class="suggestion-bold">';
                    html += suggestions[i].substring(j, j + view.techProfileInputString.length);
                    html += '</span>';
                    j += view.techProfileInputString.length;
                } else {
                    html += suggestions[i][j];
                    j++;
                }
            }
            html += '</div>';
            $techProfilesSuggestionBox.append(html);
        }
    }
};

techProfileInputArrowKeypress = function(event) {
    var view = event.data,
        $searchVan,
        possibleSelections, i;

    $searchVan = $('#techprofilesearch-techprofile', view.$element);

    if (event.which !== 38 && event.which !== 40) {
        return;
    }

    possibleSelections = $('#techprofiles-suggestions-box > div');

    // arrow keys codes: right, up, left, down  =  39 38 37 40
    if (event.which == 38) { // up
        view.techProfileSelectionIndex--;
    } else if (event.which == 40) {
        view.techProfileSelectionIndex++;
    }

    if (view.techProfileSelectionIndex > possibleSelections.length) { // clamp
        view.techProfileSelectionIndex = 0;
    } else if (view.techProfileSelectionIndex < 0) {
        view.techProfileSelectionIndex = possibleSelections.length;
    }
    // set classes for selected.
    for (i = 0; i < possibleSelections.length; i++) {
        $(possibleSelections[i]).removeClass('suggestion-selected');
        if (i + 1 == view.gearSelectionIndex) { // gearSelectionIndex is 0 when not selected.
            $(possibleSelections[i]).addClass('suggestion-selected');
        }
    }

    if (view.techProfileSelectionIndex !== 0) {
        // set input text to the value of the selection
        $searchVan.val($('.suggestion-selected').text());
    } else {
        // set input text back to old input value
        $searchVan.val(view.techProfileInputString);
    }

    $searchVan.focus();
    $searchVan.val($searchVan.val());

    // prevents input field to set caret to start position.
    return false;
};

searchTechProfileLoseFocus = function(event) {
    var view = event.data;
    // clears suggestion box when losing focus
    $('#techprofiles-suggestions-box', view.$element).hide();
};

searchTechProfileGainFocus = function(event) {
    var view = event.data;
    $('#techprofiles-suggestions-box', view.$element).show();
};

setTechProfileSuggestion = function(event) {
    var view = event.data;
    $('#techprofilesearch-techprofile', view.$element).val($(event.target).text());
    $('#techprofiles-suggestions-box', view.$element).hide();
};

getSearchParameters = function() {
    var view = this,
        $locationContainer,
        location, searchString, dateRange, pickupDate, returnDate, searchParameters;

    // remove gear suggestion dropdown when submitting
    $('#techprofiles-suggestions-box', view.$element).hide();

    $locationContainer = $('#techprofilesearch-location', view.$element);
    location = $locationContainer.val();
    if (location === '') {
        location = $locationContainer.attr('placeholder');
    }

    //URI playground
    //dateRange = '20140828-20140901';
    pickupDate = new Moment.tz($('#techprofilesearch-pickup', view.$element).val(), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    returnDate = new Moment.tz($('#techprofilesearch-return', view.$element).val(), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
    dateRange = pickupDate.format('YYYYMMDD') + '-' + returnDate.format('YYYYMMDD');
    searchString = $('#techprofilesearch-techprofile', this.$element).val();

    searchParameters = {
        techProfileString: searchString,
        locationString: location,
        dateRangeString: dateRange
    };
    return searchParameters;
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    prefillForm: prefillForm,

    handlePickupDate: handlePickupDate,
    handleDeliveryDate: handleDeliveryDate,
    handlePickupSelection: handlePickupSelection,
    handleDeliverySelection: handleDeliverySelection,

    handleSearch: handleSearch,
    showTechProfileSuggestions: showTechProfileSuggestions,
    drawTechProfileSuggestions: drawTechProfileSuggestions,
    techProfileInputArrowKeypress: techProfileInputArrowKeypress,
    searchTechProfileLoseFocus: searchTechProfileLoseFocus,
    searchTechProfileGainFocus: searchTechProfileGainFocus,
    setTechProfileSuggestion: setTechProfileSuggestion,

    getSearchParameters: getSearchParameters
});
