/**
 * Controller for the Sharingear Search form.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'underscore', 'viewcontroller', 'googlemaps', 'app', 'moment', 'utilities'],
	function($, _, ViewController, GoogleMaps, App, Moment, Utilities) { //daterangepicker do not support AMD
		var numberOfGearSuggestions = 5,
			geocoder,

			didInitialize,
			didRender,
			prefillForm,

			handlePickupDate,
			handleDeliveryDate,
			handlePickupDeliveryCalendarSelection,

			handleSearch,
			showGearSuggestions,
			drawGearSuggestions,
			gearInputArrowKeypress,
			searchGearLoseFocus,
			searchGearGainFocus,
			setGearSuggestion,

			getSearchParameters;

		//Static variables
		geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			this.gearSelectionIndex = 0;
			this.gearInputString = '';
			this.gearSuggestionsArray = null; // array of strings
            this.didSearchBefore = false;
            this.calendarVC = null;
		};

		didRender = function() {
			var view = this,
            	$searchPickup, $searchReturn;

            $searchPickup = $('#search-pickup', view.$element);
            $searchReturn = $('#search-return', view.$element);

            new GoogleMaps.places.Autocomplete($('#search-location', view.$element)[0], {types: ['geocode']});

    		this.prefillForm();

    		this.setupEvent('click', '#search-pickup', this, this.handlePickupDate);
    		this.setupEvent('click', '#search-return', this, this.handleDeliveryDate);
			this.setupEvent('submit', '#home-search-form', this, this.handleSearch);
			this.setupEvent('input', '#search-gear', this, view.showGearSuggestions);
			this.setupEvent('keydown', '#search-gear', this, view.gearInputArrowKeypress);
			this.setupEvent('focusout', '#search-gear', this, view.searchGearLoseFocus);
			this.setupEvent('focusin', '#search-gear', this, view.searchGearGainFocus);
            this.setupEvent('mousedown touchstart', '.gear-suggestion', this, view.setGearSuggestion);
		};

		prefillForm = function() {
			var view = this,
				$searchPickup, $searchReturn,
				queryString, previousSearchGear, previousSearchLocation, previousSearchDateRange;

			$searchPickup = $('#search-pickup', view.$element);
            $searchReturn = $('#search-return', view.$element);

			if(App.user.data && App.user.data.currentCity !== null && App.user.data.currentCity !== '') {
                $('#search-location', view.$element).attr('placeholder', App.user.data.currentCity);
            }

			queryString = window.location.href.split('?')[1];
			if(queryString) {
            	previousSearchGear = Utilities.getQueryStringParameterValue(queryString, 'gear');
            	previousSearchLocation = Utilities.getQueryStringParameterValue(queryString, 'location');
            	previousSearchDateRange = Utilities.getQueryStringParameterValue(queryString, 'daterange');
            	previousSearchDateRange = previousSearchDateRange.split('-');
            	$('#search-gear', this.$element).val(previousSearchGear);
            	$('search-location', this.$element).val(previousSearchLocation);
            	//$searchPickup.data('daterangepicker').setStartDate(new Moment(previousSearchDateRange[0], 'YYYYMMDD'));
            	//$searchReturn.data('daterangepicker').setStartDate(new Moment(previousSearchDateRange[1], 'YYYYMMDD'));
			}
			else {
				//$searchPickup.data('daterangepicker').updateInputText();
            	//$searchReturn.data('daterangepicker').updateInputText();
			}
		};

		handlePickupDate = function(event) {
			var view = event.data,
				passedData = {},
				$calendarContainer, pickupInputString;

			pickupInputString = $('#search-pickup', view.$element).val();
			
			if(pickupInputString !== '') {
				passedData = {
					pickupDate: pickupInputString,
					pickupActive: true
				};
			}

			$calendarContainer = $('#gearsearchform-pickupdeliverycalendar', view.$element);
			
			require(['viewcontrollers/pickupdeliverycalendar', 'text!../templates/pickupdeliverycalendar.html'], function(calendarVC, calendarVT) {
				view.calendarVC = new calendarVC.constructor({name: 'pickupdeliverycalendar', $element: $calendarContainer, template: calendarVT, passedData: passedData});
				view.calendarVC.initialize();
				view.calendarVC.render();
				view.calendarVC.on('close', view.handlePickupDeliveryCalendarSelection);
			});
		};

		handleDeliveryDate = function(event) {
			var view = event.data,
				passedData = {},
				$calendarContainer, deliveryInputString;

			deliveryInputString = $('#search-return', view.$element).val();
			if(deliveryInputString !== '') {
				passedData = {
					pickupDate: $('#search-pickup', view.$element).val(),
					deliveryDate: deliveryInputString,
					pickupActive: false
				};
			}
			
			$calendarContainer = $('#gearsearchform-pickupdeliverycalendar', view.$element);
			
			require(['viewcontrollers/pickupdeliverycalendar', 'text!../templates/pickupdeliverycalendar.html'], function(calendarVC, calendarVT) {
				view.calendarVC = new calendarVC.constructor({name: 'pickupdeliverycalendar', $element: $calendarContainer, template: calendarVT, passedData: passedData});
				view.calendarVC.initialize();
				view.calendarVC.render();
				view.calendarVC.on('close', view.handlePickupDeliveryCalendarSelection);
			});
		};

		handlePickupDeliveryCalendarSelection = function(vc) {
			$('#search-pickup', this.$element).val(vc.pickupDate.format('DD/MM/YYYY'));
			$('#search-return', this.$element).val(vc.deliveryDate.format('DD/MM/YYYY'));
		};

		/**
		 * Displays search results from the model.
		 * @param event: jQuery event object
		 * @param callback: callback function
		 * @return Always false to avoid triggering HTML form
		 */
		handleSearch = function(event) {
			var view = event.data,
				searchParams;

			searchParams = view.getSearchParameters();
            App.router.setQueryString('location=' + encodeURIComponent(searchParams.locationString) + '&gear=' + encodeURIComponent(searchParams.gearString) + '&daterange=' + searchParams.dateRangeString);
            if(App.router.currentViewController.name === 'search') {
            	App.router.currentViewController.performSearch(searchParams.gearString, searchParams.locationString, searchParams.dateRangeString);
            }
            else {
            	App.router.navigateTo('search');
            }
			return false;
		};

		showGearSuggestions = function(event) {
			var view = event.data,
				$searchGear = $('#search-gear', view.$element),
				searchString, gList, brandsSuggestions, classificationSuggestions;

			searchString = $searchGear.val();
			if (view.gearSelectionIndex === 0) {
				view.gearInputString = searchString; // save the input string when nothing is selected
			}
			// reset selection if new input was added since we saved the gearinputstring
			if (view.gearInputString !== searchString) { 
				view.gearSelectionIndex = 0; 
				view.gearInputString = searchString;
			}

			searchString = searchString.toLowerCase().trim();

			gList = App.gearClassification.data;
			classificationSuggestions = _.map(gList.classification, function(value) {
				var gear;
				gear = _.filter(value, function(subtype) {
					var subtypeName = subtype.subtype.toLowerCase(),
						searchIndex;
					searchIndex = subtypeName.indexOf(searchString);
					return searchIndex >= 0;
				});
				return _.map(gear, function(value) {
					return value.subtype;
				});
			});
			classificationSuggestions = _.flatten(classificationSuggestions);

			brandsSuggestions = _.filter(gList.brands, function(brand) {
				var searchIndex = brand.toLowerCase().indexOf(searchString);
				return searchIndex >= 0;
			});
			
			view.gearSuggestionsArray = classificationSuggestions.concat(brandsSuggestions);
			view.gearSuggestionsArray = _.first(view.gearSuggestionsArray, numberOfGearSuggestions);
			view.drawGearSuggestions();
		};

		drawGearSuggestions = function() {
			var view = this,
				$gearSuggestionBox = $('#gear-suggestions-box', view.$element),
				$searchField, suggestions, i, html, j;

			$gearSuggestionBox.html('');
			// hides or styles box
			if(view.gearInputString.length === 0) {
				$gearSuggestionBox.addClass('hidden');
				return;
			}

			$gearSuggestionBox.removeClass('hidden');

			$searchField = $('#search-gear', view.$element);
			$gearSuggestionBox.css({
				'position': 'absolute',
				'width': $searchField.outerWidth(),
				'left': $searchField.position().left,
				'top': $searchField.position().top + $searchField.outerHeight()
			});

			suggestions = view.gearSuggestionsArray;

			for (i = 0; i < numberOfGearSuggestions; i++) {
				if(suggestions.length > i) {
					html = '<div class="gear-suggestion">';
					html += '<span class="gear-suggestion-icon"></span>';
					// parse string and check if any substring is equal to any part of view.gearInputString separated by " "
					// if so, write it in bold, else write characters 
					j = 0;
					while (j < suggestions[i].length) {
						// if view.gearInputString is here at suggestions[i][j]
						if (suggestions[i].toLowerCase().indexOf(view.gearInputString) == j	&& (j < 1 || suggestions[i][j - 1] == ' ')) {
							html += '<span class="gear-suggestion-bold">';
							html += suggestions[i].substring(j, j + view.gearInputString.length);
							html += '</span>';
							j += view.gearInputString.length;
						}
						else {
							html += suggestions[i][j];
							j++;
						}
					}
					html += '</div>';
					$gearSuggestionBox.append(html);
				}
			}
		};

		gearInputArrowKeypress = function(event) {
			var view = event.data,
				$searchGear,
				possibleSelections, i;

			$searchGear = $('#search-gear', view.$element);
			
			if(event.which !== 38 && event.which !== 40) {
				return;
			}

			possibleSelections = $('#gear-suggestions-box > div');
				
			// arrow keys codes: right, up, left, down  =  39 38 37 40
			if(event.which == 38) { // up
				view.gearSelectionIndex--;
			}
			else if(event.which == 40) {
				view.gearSelectionIndex++;
			}
				
			if(view.gearSelectionIndex > possibleSelections.length) { // clamp
				view.gearSelectionIndex = 0;
			}
			else if(view.gearSelectionIndex < 0) {
				view.gearSelectionIndex = possibleSelections.length;
			}
			// set classes for selected.
			for (i = 0; i < possibleSelections.length; i++) {
				$(possibleSelections[i]).removeClass('gear-suggestion-selected');
				if (i + 1 == view.gearSelectionIndex) { // gearSelectionIndex is 0 when not selected.
					$(possibleSelections[i]).addClass('gear-suggestion-selected');
				}
			}

			if (view.gearSelectionIndex !== 0) {
				// set input text to the value of the selection
				$searchGear.val($('.gear-suggestion-selected').text());
			}
			else {
				// set input text back to old input value
				$searchGear.val(view.gearInputString);
			}

			$searchGear.focus();
			$searchGear.val($searchGear.val());

			// prevents input field to set caret to start position.
			return false;
		};

		searchGearLoseFocus = function(event) {
			var view = event.data;
			// clears suggestion box when losing focus
			$('#gear-suggestions-box', view.$element).hide();
		};

		searchGearGainFocus = function(event) {
			var view = event.data;
			$('#gear-suggestions-box', view.$element).show();
		};

		setGearSuggestion = function(event) {
			var view = event.data;
			$('#search-gear', view.$element).val($(event.target).text());
			$('#gear-suggestions-box', view.$element).hide();
		};

		getSearchParameters = function() {
			var view = this,
				$locationContainer,
				location, searchString, dateRange, pickupDate, returnDate;

            // remove gear suggestion dropdown when submitting
            $('#gear-suggestions-box', view.$element).hide();

			$locationContainer = $('#home-search-form #search-location', view.$element);
			location = $locationContainer.val();
			if(location === '') {
				location = $locationContainer.attr('placeholder');
			}

            //URI playground
            //dateRange = '20140828-20140901';
            pickupDate = new Moment($('#search-pickup', view.$element).val(), 'DD/MM/YYYY');
            returnDate = new Moment($('#search-return', view.$element).val(), 'DD/MM/YYYY');
            dateRange = pickupDate.format('YYYYMMDD') + '-' + returnDate.format('YYYYMMDD');
            searchString = $('#home-search-form #search-gear', this.$element).val();

			return {
				gearString: searchString,
				locationString: location,
				dateRangeString: dateRange
			};
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			prefillForm: prefillForm,

			handlePickupDate: handlePickupDate,
			handleDeliveryDate: handleDeliveryDate,
			handlePickupDeliveryCalendarSelection: handlePickupDeliveryCalendarSelection,

			handleSearch: handleSearch,
			showGearSuggestions: showGearSuggestions,
			drawGearSuggestions: drawGearSuggestions,
			gearInputArrowKeypress: gearInputArrowKeypress,
			searchGearLoseFocus: searchGearLoseFocus,
			searchGearGainFocus: searchGearGainFocus,
			setGearSuggestion: setGearSuggestion,

			getSearchParameters: getSearchParameters
		});
	}
);