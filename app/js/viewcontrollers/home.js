/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['underscore', 'jquery', 'utilities', 'viewcontroller', 'models/gearlist', 'app', 'googlemaps', 'facebook', 'moment', 'daterangepicker', 'owlcarousel'],
	function(_, $, Utilities, ViewController, GearList, App, GoogleMaps, FB, Moment) { //daterangepicker and owlcarousel do not support AMD
		var searchBlockID = 'home-search-row',
			numberOfGearSuggestions = 5,
			geocoder,

			didInitialize,
			didRender,

			setupEvents,

			handleSearch,
			populateSearchBlock,

			showGearSuggestions,
			drawGearSuggestions,
			setGearSuggestion,
			gearInputArrowKeypress,
			searchGearLoseFocus,
			searchGearGainFocus;

		//Static variables
		geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			this.gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
//          this.isImageVertical = false;
			this.gearSelectionIndex = 0;
			this.gearInputString = '';
			this.gearSuggestionsArray = null; // array of strings
            this.didSearchBefore = false;
		};

		didRender = function() {
            //Loading the daterangepicker with available days from today
            var view = this,
            	startDate = new Moment();

            //Filling the Location input with current location using HTML5 only if User.city is empty
            if(App.user.data.city === '' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    var lat, lon; 
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    Utilities.getCityFromCoordinates(lat, lon, function (locationCity) {
                        App.user.data.city = locationCity;
                        $('#search-location', view.$element).attr('placeholder', locationCity);
                    });
                });
            }
            else {
                $('#search-location', view.$element).attr('placeholder', App.user.data.city);
            }

            $('#search-date', view.$element).daterangepicker({
                singleDatePicker: true,
                format: 'DD/MM/YYYY',
                startDate: startDate.format('DD/MM/YYYY'),
                showDropdowns: true,
                minDate: startDate.format('DD/MM/YYYY')
            });

            startDate.add(1, 'days');

            $('#search-return', view.$element).daterangepicker({
                singleDatePicker: true,
                format: 'DD/MM/YYYY',
                startDate: startDate.format('DD/MM/YYYY'),
                showDropdowns: true,
                minDate: startDate.format('DD/MM/YYYY'),
                opens: 'right'
            });

            /*var previousSearchLocation = Utilities.getQueryStringParameterValue(window.location.search, 'location');
            var previousSearchGear = Utilities.getQueryStringParameterValue(window.location.search, 'gear');
            var previousSearchDate = Utilities.getQueryStringParameterValue(window.location.search, 'daterange');
            this.didSearchBefore = Utilities.getQueryStringParameterValue(window.location.search, 'didsearchbefore');*/

            //Testimonials init
            $('#feedbacks', view.$element).owlCarousel({
                navigation: false, // Show next and prev buttons
                slideSpeed: 800,
                paginationSpeed: 400,
                autoPlay: 7000,
                singleItem: true
            });

			new GoogleMaps.places.Autocomplete($('#search-location', view.$element)[0], {types: ['geocode']});

			//this.$element.append('<div id="gear-suggestions-box" style="display: none;"></div>');

            //Fill and run search if a previous search was registered
            /*if (this.didSearchBefore) {
                if (previousSearchLocation !== '' || previousSearchDate !== '' || previousSearchGear !== '') {
                    console.log('previous search was with gear: '+previousSearchGear);
                    $('#search-gear').val(previousSearchGear);
//                    $("#search-location").val(previousSearchLocation);
                    //Should also set the date

                    //Trigger the submit action
                    $('#home-submit-button-id').click();
                }
            }*/
            this.setupEvent('submit', '#home-search-form', this, this.handleSearch);
			this.setupEvent('input', '#search-gear', this, view.showGearSuggestions);
			this.setupEvent('keydown', '#search-gear', this, view.gearInputArrowKeypress);
			this.setupEvent('focusout', '#search-gear', this, view.searchGearLoseFocus);
			this.setupEvent('focusin', '#search-gear', this, view.searchGearGainFocus);
            this.setupEvent('mousedown touchstart', '.gear-suggestion', this, view.setGearSuggestion);
        };

		/**
		 * Displays search results from the model.
		 * @param event: jQuery event object
		 * @param callback: callback function
		 * @return Always false to avoid triggering HTML form
		 */
		handleSearch = function(event, callback) {
			var view = event.data,
				$locationContainer,
				location;

            if (view.didSearchBefore===false) {
                view.didSearchBefore=true;
            }

			//Remove promo block and billboard
			$('#home-promo-block', view.$element).css({
				display: 'none'
			});
			$('.billboard-how-it-works', view.$element).css({
				display: 'none'
			});

            // remove gear suggestion dropdown when submitting
            $('#gear-suggestions-box', view.$element).hide();

			$locationContainer = $('#home-search-form #search-location', view.$element);
			location = $locationContainer.val();
			if(location === '') {
				location = $locationContainer.attr('placeholder');
			}

            //URI playground
//            searchString = $('#home-search-form #search-gear', this.$element).val();
//            App.router.setQueryString('location=' + encodeURIComponent(location) + '&gear=' + encodeURIComponent(searchString) + '&daterange=' + '20140828-20140901'+'&didsearchbefore=true');

            geocoder.geocode({address: location}, function(results, status) {
				var locationData, searchString;
				if(status === GoogleMaps.GeocoderStatus.OK) {
					locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					searchString = $('#home-search-form #search-gear', view.$element).val();
                    //App.router.setQueryString('location=' + locationData + '&gear=' + encodeURIComponent(searchString) + '&daterange=' + '20140828-20140901'+'&didsearchbefore=true');

					view.gearList.search(locationData, searchString, '20140828-20140901', function(searchResults) {
                        view.populateSearchBlock(searchResults);
						if(callback && typeof callback === 'function') {
							callback();
						}
					});
				}
				else {
					console.log('Error geocoding: ' + status);
					alert('Couldn\'t find location');
                    view.populateSearchBlock([]);
				}
			});

			view.setupEvent('click', '#fb-share-btn', view, function() {
				var instrument, description;

				instrument = $('#home-search-form #search-gear', view.$element).val();
				description = 'Hey, I am looking for a ' + instrument + ' near ' + location + ' - anyone? Help me out at www.sharingear.com, because I am willing to rent it from you!';

				FB.ui({
					method: 'feed',
					caption: 'Request an instrument on Sharingear!',
					link: 'sharingear.com',
					description: description
				}, function() {});
			});

			return false;
		};

		/**
		 * Generate the search results HTML and insert it into the search results block.
		 * @param searchResults: an array of objects.
		 */
		populateSearchBlock = function(searchResults, callback) {
            var view = this,
            	$searchBlock = $('#' + searchBlockID, this.$element);

			$searchBlock.empty();

            if (searchResults.length <= 0) {
				$('#home-search-block #testRow', view.$element).empty();
            	$('#home-search-block .no-results-block', view.$element).show();
				return;
			}

            $('#home-search-block .no-results-block', view.$element).hide();


			require(['text!../templates/search-results.html'], function(SearchResultTemplate) {
				var searchResultTemplate = _.template(SearchResultTemplate),
					defaultSearchResults, searchResult, imagesTest, i;

				defaultSearchResults = {
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: '',
					description: '',
					images: '',
                    image: '',
					price: 0,
					city: '',
					address: '',
					price_a: 0,
					price_b: 0,
					price_c: 0,
					owner_id: null
				};

				for(i = 0; i < searchResults.length; i++) {
					searchResult = searchResults[i].data;
					imagesTest = searchResult.images.split(',');
                    searchResult.image = imagesTest[0];

                    if (searchResult.image === '') {
                        searchResult.image = 'images/placeholder_grey.png';
                    }
                    view.price = searchResults[i].price_a;

					_.extend(defaultSearchResults, searchResult);
					$searchBlock.append(searchResultTemplate(defaultSearchResults));


                    //Set background-image with jQuery
                    $searchBlock.children().eq(i).children(':first').css('background-image', 'url("' + searchResult.image + '")');


                    //Check if image is vertical or horizontal
                    var isVertical;
                    var img = new Image();
                    img.src = searchResult.image;
                    var imgWidth = img.width;
                    var imgHeight = img.height;
                    isVertical = imgWidth < imgHeight;

                    if(isVertical) {
                        $searchBlock.children().eq(i).children(':first').addClass('image-blocks-vertical');
                    }
                    else {
                        $searchBlock.children().eq(i).children(':first').addClass('image-blocks-horizontal');
                    }

				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
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


			// get list of possible gear items
			// info about gearClassification
			// gList == {brands: [...], classification: {}}
			// gList.brands == ["Ampeg", "Avid", "Bose", "Behringer", ...]
			// gList.classification == {amp: ["Guitar amp", "Bass combo", ...], bass: [], dj: [], ...}
			gList = App.gearClassification.data;

			// find the gear items that contain input string
			brandsSuggestions = _.chain(gList.brands)
				.filter(function(b) {
					var j = b.toLowerCase().indexOf(searchString);
					return (j > -1 && (j === 0 || b[j - 1] == ' '));
				})
				.first(numberOfGearSuggestions)
				.value();

			// if we got more elements, add them from classificationsuggestions
			//if (brandsSuggestions.length < N)
			classificationSuggestions = _.chain(gList.classification)
				.map(function(c) {
					return _.filter(c, function(cItem) {
						var j = cItem.toLowerCase().indexOf(searchString);
						return j > -1 && (j === 0 || cItem[j - 1] == ' ');
					});
				})
				.flatten()
				.first(numberOfGearSuggestions)
				.value();

			if (classificationSuggestions !== undefined) {
				// change order of suggestions here.
				view.gearSuggestionsArray = classificationSuggestions.concat(brandsSuggestions);
			}
			else {
				view.gearSuggestionsArray = brandsSuggestions;
			}

			// stop if nothing found
			/*if (!view.gearSuggestionsArray) {
				// clear box
				$('#gear-suggestions-box').css({
					'display': 'none'
				});
				return;
			}*/
			view.drawGearSuggestions();
		};

		drawGearSuggestions = function() {
			var view = this,
				$gearSuggestionBox = $('#gear-suggestions-box', view.$element),
				$searchField, suggestions, i, html, j;

			$gearSuggestionBox.html('');
			// hides or styles box
			if(view.gearInputString.length === 0) {
				$gearSuggestionBox.css('display', 'none');
				return;
			}

			$searchField = $('#search-gear', view.$element);
			$gearSuggestionBox.css({
				'display': '',
				'position': 'absolute',
				'width': $searchField.outerWidth(),
				'left': $searchField.offset().left,
				'top': $searchField.offset().top + $searchField.outerHeight()
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

		setGearSuggestion = function(event) {
			var view = event.data;
			$('#search-gear', view.$element).val($(event.target).text());
			$('#gear-suggestions-box', view.$element).hide();
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

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleSearch: handleSearch,
			populateSearchBlock: populateSearchBlock,

			showGearSuggestions: showGearSuggestions,
			drawGearSuggestions: drawGearSuggestions,
			setGearSuggestion: setGearSuggestion,
			gearInputArrowKeypress: gearInputArrowKeypress,
			searchGearLoseFocus: searchGearLoseFocus,
			searchGearGainFocus: searchGearGainFocus

		});
	}
);
