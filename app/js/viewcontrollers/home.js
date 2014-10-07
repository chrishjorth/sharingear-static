/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller', 'models/gearlist', 'app', 'googlemaps', 'daterangepicker', ],
	function(_, Utilities, ViewController, GearList, App, GoogleMaps, daterangepicker) {

		var Home = ViewController.inherit({
			gearList: new GearList.constructor({
				rootURL: App.API_URL
			}),
			geocoder: new GoogleMaps.Geocoder(),
			// searchBlockID: 'home-search-block',
			searchBlockID: 'testRow',

			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleSearch: handleSearch,
			populateSearchBlock: populateSearchBlock
		});

		return Home;

		function didInitialize() {

		}

		function didRender() {
            //Loading the daterangepicker with available days from today
            var currentDate = new Date();
            var month = currentDate.getMonth() + 1;
            var day = currentDate.getDate();
            var year = currentDate.getFullYear();
            var minDateString = (day + "/" + month + "/" + year);

            $('#search-date').daterangepicker({
                singleDatePicker: false,
                format: 'DD/MM/YYYY',
                minDate: minDateString,
                showDropdowns: true
            });

            //Filling the Location input with current location using HTML5 only if User.city is empty
            if(App.user.data.city === '' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;
                    Utilities.geoLocationGetCity(lat, lon, function (locationCity) {
                        App.user.data.city = locationCity;
                        $('#search-location').val(locationCity);
                    });
                });
            }
            else {
                $('#search-location').val(App.user.data.city);
            }

            this.setupEvents();
		}

		function setupEvents() {
			this.setupEvent('submit', '#home-search-form', this, this.handleSearch);
		}



		/**
		 * Displays search results from the model.
		 * @param event: jQuery event object
		 * @param callback: callback function
		 * @return Always false to avoid triggering HTML form
		 */
		function handleSearch(event, callback) {
			var view = event.data,
				location;

			//Remove promo block and billboard
			$('#home-promo-block').css({
				display: 'none'
			});
			$('.billboard-how-it-works').css({
				display: 'none'
			});

			location = $('#home-search-form #search-location', view.$element).val();
			view.geocoder.geocode({address: location}, function(results, status) {
				var locationData;
				if(status === GoogleMaps.GeocoderStatus.OK) {
					locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					view.gearList.search(locationData, $('#home-search-form #search-gear', this.$element).val(), '20140828-20140901', function(searchResults) {
						view.populateSearchBlock(searchResults);
						if(callback && typeof callback === 'function') {
							callback();
						}
					});
				}
				else {
					console.log('Error geocoding: ' + status);
				}
			});

			return false;
		}

		/**
		 * Generate the search results HTML and insert it into the search results block.
		 * @param searchResults: an array of objects.
		 */
		function populateSearchBlock(searchResults, callback) {


			console.log(searchResults);

			var $searchBlock = $('#' + this.searchBlockID, this.$element);
			$searchBlock.empty();
			require(['text!../templates/search-results.html'], function(SearchResultTemplate) {
				var searchResultTemplate = _.template(SearchResultTemplate),
					defaultSearchResults, searchResult, i;

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
					price1: 0,
					price2: 0,
					price3: 0,
					owner_id: null
				};

				for(i = 0; i < searchResults.length; i++) {
					searchResult = searchResults[i];

					var imagesTest = searchResults[i].images.split(",");
					searchResult.image = imagesTest[0];

					
					_.extend(defaultSearchResults, searchResult);
					
					
					$searchBlock.append(searchResultTemplate(defaultSearchResults));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);