/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

define(
	['underscore', 'utilities', 'viewcontroller', 'models/gearlist', 'app', 'googlemaps', 'daterangepicker','owlcarousel' ],
	function(_, Utilities, ViewController, GearList, App, GoogleMaps, daterangepicker, owlcarousel) {

		var Home = ViewController.inherit({
			gearList: new GearList.constructor({
				rootURL: App.API_URL
			}),
			geocoder: new GoogleMaps.Geocoder(),

			//autocomplete: new GoogleMaps.places.Autocomplete(),
			// searchBlockID: 'home-search-block',
			searchBlockID: 'testRow',
//            isImageVertical: '',

			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleSearch: handleSearch,
			populateSearchBlock: populateSearchBlock,

			showGearSuggestions: showGearSuggestions,
			drawGearSuggestions: drawGearSuggestions,
			setGearSuggestion: setGearSuggestion,
			gearSuggestionsArray: null,
			numberOfGearSuggestions: 5,
			gearSelectionIndex: 0, // 0 = nothing selected. 1..5 selected option #1..#5
			gearInputString: "",
			gearInputArrowKeypress: gearInputArrowKeypress,
			searchGearLoseFocus: searchGearLoseFocus,
			searchGearGainFocus: searchGearGainFocus

		});

		return Home;

		function didInitialize() {
//            this.isImageVertical = false;
			this.gearSelectionIndex = 0;
			this.gearInputString = "";
			this.numberOfGearSuggestions = 5;
			this.gearSuggestionsArray = null; // array of strings
		}

		function didRender() {
            //Loading the daterangepicker with available days from today
            var currentDate = new Date();
            var month = currentDate.getMonth() + 1;
            var day = currentDate.getDate();
            var year = currentDate.getFullYear();
            var minDateString = (day + "/" + month + "/" + year);

            $('#search-date').daterangepicker({
                singleDatePicker: true,
                format: 'DD/MM/YYYY',
                startDate: minDateString,
                showDropdowns: true,
                minDate: minDateString
            });

            //Filling the Location input with current location using HTML5 only if User.city is empty
            if(App.user.data.city === '' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;
                    Utilities.getCityFromCoordinates(lat, lon, function (locationCity) {
                        App.user.data.city = locationCity;
                        $('#search-location').attr("placeholder", locationCity);
                    });
                });
            }
            else {
                $('#search-location').attr("placeholder", App.user.data.city);
            }

            $('#search-return').daterangepicker({
                singleDatePicker: true,
                format: 'DD/MM/YYYY',
                startDate: minDateString,
                showDropdowns: true,
                minDate: minDateString,
                opens: 'right'
            });

            //Testimonials init
            $("#feedbacks").owlCarousel({
                navigation: false, // Show next and prev buttons
                slideSpeed: 800,
                paginationSpeed: 400,
                autoPlay: 7000,
                singleItem: true
            });

            var owl = $("#screenshots");

            owl.owlCarousel({
                items: 4, //10 items above 1000px browser width
                itemsDesktop: [1000, 4], //5 items between 1000px and 901px
                itemsDesktopSmall: [900, 2], // betweem 900px and 601px
                itemsTablet: [600, 1], //2 items between 600 and 0
                itemsMobile: false // itemsMobile disabled - inherit from itemsTablet option
            });

						var input = /** @type {HTMLInputElement} */(
      			document.getElementById('search-location'));

						var options = {types: ['geocode']};

						var autocomplete = new GoogleMaps.places.Autocomplete(input, options);

			this.$element.append('<div id="gear-suggestions-box" style="display: none;"></div>');

            this.setupEvents();
		}

		function setupEvents() {
			var view = this;

			this.setupEvent('submit', '#home-search-form', this, this.handleSearch);
			this.setupEvent('input', '#search-gear', this, view.showGearSuggestions);
			this.setupEvent('keydown', '#search-gear', this, view.gearInputArrowKeypress);
			this.setupEvent('focusout', '#search-gear', this, view.searchGearLoseFocus);
			this.setupEvent('focusin', '#search-gear', this, view.searchGearGainFocus);
            this.setupEvent('mousedown touchstart', '.gear-suggestion', this, view.setGearSuggestion);
		}

		/**
		 * Displays search results from the model.
		 * @param event: jQuery event object
		 * @param callback: callback function
		 * @return Always false to avoid triggering HTML form
		 */
		function handleSearch(event, callback) {
			var view = event.data,
				$locationContainer,
				location;

			//Remove promo block and billboard
			$('#home-promo-block').css({
				display: 'none'
			});
			$('.billboard-how-it-works').css({
				display: 'none'
			});

            // remove gear suggestion dropdown when submitting
            $('#gear-suggestions-box').hide();

			$locationContainer = $('#home-search-form #search-location', view.$element);
			location = $locationContainer.val();
			if(location === '') {
				location = $locationContainer.attr('placeholder');
			}
			view.geocoder.geocode({address: location}, function(results, status) {
				var locationData, searchString;
				if(status === GoogleMaps.GeocoderStatus.OK) {
					locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					searchString = $('#home-search-form #search-gear', this.$element).val();
					App.router.setQueryString('location=' + locationData + '&gear=' + encodeURIComponent(searchString) + '&daterange=' + '20140828-20140901');

					view.gearList.search(locationData, searchString, '20140828-20140901', function(searchResults) {

                        view.populateSearchBlock(searchResults);
						if(callback && typeof callback === 'function') {
							callback();
						}
					});
				}
				else {
					console.log('Error geocoding: ' + status);
					noResults();
				}
			});

			$('#fb-share-btn').on('click', function(event) {

				instrument = $('#home-search-form #search-gear', view.$element).val();
				description = 'Hey, I am looking for a ' + instrument + ' near ' + location + ' - anyone? Help me out at www.sharingear.com, because I am willing to rent it from you!';

				FB.ui({
					method: 'feed',
					caption: 'Request an instrument on Sharingear!',
					link: 'sharingear.com',
					description: description
				}, function(response) {
					//console.log(response);
				});
			});

			return false;
		}

		function noResults() {
            $('#home-search-block').find('#testRow').empty();
            $('#home-search-block').find('.no-results-block').show();
		}

		/**
		 * Generate the search results HTML and insert it into the search results block.
		 * @param searchResults: an array of objects.
		 */
		function populateSearchBlock(searchResults, callback) {

            var $searchBlock = $('#' + this.searchBlockID, this.$element);

			$searchBlock.empty();

            if (searchResults.length <= 0) {
				noResults();
				return;
			}

            $('#home-search-block').find('.no-results-block').hide();


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
					imagesTest = searchResult.images.split(",");
                    searchResult.image = imagesTest[0];

                    //TODO Temporary default image
                    if (searchResult.image === '') {
                        //searchResult.image = 'http://cdn.mos.musicradar.com/images/Guitarist/323/marshall-ma50c-630-80.jpg';
                        searchResult.image = 'http://www.rondomusic.com/photos/electric/gg1kwt5.jpg';
                    }
                    this.price = searchResults[i].price_a;

					_.extend(defaultSearchResults, searchResult);
					$searchBlock.append(searchResultTemplate(defaultSearchResults));


                    //Set background-image with jQuery
                    $searchBlock.children().eq(i).children(":first").css("background-image","url(\'"+searchResult.image+"\')");


                    //Check if image is vertical or horizontal
                    var isVertical;
                    var img = new Image();
                    img.src = searchResult.image;
                    var imgWidth = img.width;
                    var imgHeight = img.height;
                    isVertical = imgWidth < imgHeight;

                    if (isVertical) {
                        $searchBlock.children().eq(i).children(":first").addClass("image-blocks-vertical");
                    }else{
                        $searchBlock.children().eq(i).children(":first").addClass("image-blocks-horizontal");
                    }

				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function showGearSuggestions(event) {
			var view = event.data;
            console.log('showGearSuggestions');
			if (view.gearSelectionIndex == 0) {
				view.gearInputString = $('#search-gear').val(); // save the input string when nothing is selected
			}
			// reset selection if new input was added since we saved the gearinputstring
			if (view.gearInputString != $('#search-gear').val()) { 
				view.gearSelectionIndex = 0; 
				view.gearInputString = $('#search-gear').val();
			}

			var inputValue = $('#search-gear').val().toLowerCase();

			while(inputValue[inputValue.length-1] == " ") {
				inputValue = inputValue.substring(0, inputValue.length-1);
			}
			while(inputValue[0] == " ") {
				inputValue = inputValue.substring(1);
			}

			// How many elements to show in the list.
			var N = view.numberOfGearSuggestions;

			// get list of possible gear items
			var gList = App.gearClassification.data;
			/// info about gearClassification
			/// gList == {brands: [...], classification: {}}
			/// gList.brands == ["Ampeg", "Avid", "Bose", "Behringer", ...]
			/// gList.classification == {amp: ["Guitar amp", "Bass combo", ...], bass: [], dj: [], ...}

			// find the gear items that contain input string
			var brandsSuggestions = _.chain(gList.brands)
				.filter(function(b) {
					var j = b.toLowerCase().indexOf(inputValue);
					return j > -1 && (j==0 || b[j-1] == " ");
				})
				.first(N)
				.value();

			// if we got more elements, add them from classificationsuggestions
			//if (brandsSuggestions.length < N)
			var classificationSuggestions = _.chain(gList.classification)
				.map(function(c) {
					return _.filter(c, function(cItem) {
						var j = cItem.toLowerCase().indexOf(inputValue);
						return j > -1 && (j==0 || cItem[j-1] == " ");
					});
				})
				.flatten()
				.first(N)
				.value();

			var suggestions;
			if (classificationSuggestions != undefined) {
				// change order of suggestions here.
				suggestions = classificationSuggestions.concat(brandsSuggestions);
			} else {
				suggestions = brandsSuggestions;
			}

			view.gearSuggestionsArray = suggestions;

			// stop if nothing found
			if (!suggestions) {
				// clear box
				$('#gear-suggestions-box').css({
					"display":"none"
				});
				return;
			}

			view.drawGearSuggestions();
			
		}

		function drawGearSuggestions() {
			var view = this;
			$('#gear-suggestions-box').html("");
			// hides or styles box
			if (view.gearInputString.length == 0) {
				$('#gear-suggestions-box').css("display","none");
				return;
				
			} else {
				var searchField = $("#search-gear");
				$('#gear-suggestions-box').css({
					"display":"",
					"position":"absolute",
					"width": searchField.outerWidth(),
					"left": searchField.offset().left,
					"top": searchField.offset().top + searchField.outerHeight()
				});
			}

			// How many elements to show in the list.
			var N = view.numberOfGearSuggestions;

			var suggestions = view.gearSuggestionsArray;

			for (var i = 0; i < N; i++) {
				if (suggestions.length > i) {
					var html = '<div class="gear-suggestion">';
					html += '<span class="gear-suggestion-icon"></span>'
					// parse string and check if any substring is equal to any part of view.gearInputString separated by " "
					// if so, write it in bold, else write characters 
					var j = 0;
					while (j < suggestions[i].length) {
						// if view.gearInputString is here at suggestions[i][j]
						if (suggestions[i].toLowerCase().indexOf(view.gearInputString) == j
							&& (j<1 || suggestions[i][j-1] == " ")) {
							html += '<span class="gear-suggestion-bold">';
							html += suggestions[i].substring(j, j+view.gearInputString.length);
							html += '</span>';
							j += view.gearInputString.length;
						} else {
							html += suggestions[i][j];
							j++;
						}
					}
					html += '</div>';
					$("#gear-suggestions-box").append(html);
				}
			}
		}

		function setGearSuggestion(event) {
            console.log('click');
			$("#search-gear").val($(event.target).text());
			$("#gear-suggestions-box").hide();
		}

		function gearInputArrowKeypress(event) {
			var view = event.data;
			if (event.which == 38 || event.which == 40) {
				var possibleSelections = $("#gear-suggestions-box > div");
				
				// arrow keys codes: right, up, left, down  =  39 38 37 40
				if (event.which == 38) { // up
					view.gearSelectionIndex--;
				} else if (event.which == 40) {
					view.gearSelectionIndex++;
				}
				if (view.gearSelectionIndex > possibleSelections.length) { // clamp
					view.gearSelectionIndex = 0;
				} else if (view.gearSelectionIndex < 0) {
					view.gearSelectionIndex = possibleSelections.length;
				}
				// set classes for selected.
				for (var i = 0; i < possibleSelections.length; i++) {
					$(possibleSelections[i]).removeClass("gear-suggestion-selected");
					if (i+1 == view.gearSelectionIndex) // gearSelectionIndex is 0 when not selected.
						$(possibleSelections[i]).addClass("gear-suggestion-selected");
				};

				var searchGear = $("#search-gear");
				if (view.gearSelectionIndex != 0) {
					// set input text to the value of the selection
					searchGear.val($(".gear-suggestion-selected").text());
				} else {
					// set input text back to old input value
					searchGear.val(view.gearInputString);
				}

				var searchGearLength = searchGear.val().length * 2;

				searchGear.focus();
				//searchGear[0].setSelectionRange(searchGearLength, searchGearLength);
				searchGear.val(searchGear.val());

				// prevents input field to set caret to start position.
				return false;
			}
		}

		function searchGearLoseFocus(event) {
            console.log('out');

			// clears suggestion box when losing focus
			$('#gear-suggestions-box').hide();
		}

		function searchGearGainFocus(event) {
			$('#gear-suggestions-box').show();
		}
	}
);
