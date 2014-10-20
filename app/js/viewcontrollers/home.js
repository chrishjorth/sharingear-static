/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller', 'models/gearlist', 'app', 'googlemaps', 'daterangepicker','owlcarousel' ],
	function(_, Utilities, ViewController, GearList, App, GoogleMaps, daterangepicker, owlcarousel) {

		var Home = ViewController.inherit({
			gearList: new GearList.constructor({
				rootURL: App.API_URL
			}),
			geocoder: new GoogleMaps.Geocoder(),
			// searchBlockID: 'home-search-block',
			searchBlockID: 'testRow',
//            isImageVertical: '',

			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleSearch: handleSearch,
			populateSearchBlock: populateSearchBlock
		});

		return Home;

		function didInitialize() {
//            this.isImageVertical = false;
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

            if(navigator.geolocation) {
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
			var $searchBlock = $('#' + this.searchBlockID, this.$element);
			$searchBlock.empty();
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
	}
);