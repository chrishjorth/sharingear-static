/**
 * Controller for the Sharingear Search view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'underscore', 'viewcontroller', 'app', 'googlemaps', 'models/gearlist', 'facebook'],
	function($, _, ViewController, App, GoogleMaps, GearList, FB) {
		var searchBlockID = 'home-search-row',
			geocoder,
			
			didInitialize,
			didRender,
			renderMap,

			performSearch,
			populateSearchBlock;

		//Static variables
		geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			this.searchFormVC = null;

			this.gearList = new GearList.constructor({
				rootURL: App.API_URL
			});
			this.gearList.initialize();

			this.latitude = 0.0;
			this.longitude = 0.0;
		};

		didRender = function() {
			var view = this,
				$searchformContainer = $('.searchform-container', this.$element),
				searchParameters;

			if(this.searchFormVC === null) {
				require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
					view.searchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('.searchform-container', view.$element), template: gearSearchVT});
					view.searchFormVC.render();
					searchParameters = view.searchFormVC.getSearchParameters();
					view.performSearch(searchParameters.gearString, searchParameters.locationString, searchParameters.dateRangeString);
				});
			}
			else {
				searchParameters = view.searchFormVC.getSearchParameters();
				view.performSearch(searchParameters.gearString, searchParameters.locationString, searchParameters.dateRangeString);
			}
		};

		renderMap = function() {
			var mapOptions, latlong, marker;

			//get coordinates for location

			//draw map
			latlong = new GoogleMaps.LatLng(this.latitude, this.longitude);
			mapOptions = {
				center: latlong,
				zoom: 14,
				maxZoom: 14
			};
			this.map = new GoogleMaps.Map(document.getElementById('search-map'), mapOptions);

			//add markers based on search results

			/*if(gear.latitude !== null && gear.longitude !== null) {
				latlong = new GoogleMaps.LatLng(gear.latitude, gear.longitude);
				mapOptions = {
					center: latlong,
					zoom: 14,
					maxZoom: 14
				};
				this.map = new GoogleMaps.Map(document.getElementById('gearprofile-map'), mapOptions);
				marker = new GoogleMaps.Marker({
					position: latlong,
					map: this.map,
					icon: 'images/shagicon_003.png' // TODO: put icon on server
				});
			}*/
		};

		performSearch = function(gear, location, dateRange) {
			var view = this;
			
			App.user.setSearchInterval(dateRange);
			if(location === '' || location === 'all' || location === null) {
				location = 'all';
				view.gearList.search(location, gear, dateRange, function(searchResults) {
					view.populateSearchBlock(searchResults);
					view.renderMap();
				});
			}
			else {
				geocoder.geocode({address: location}, function(results, status) {
					var locationData;
					if(status === GoogleMaps.GeocoderStatus.OK) {
						locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
						view.gearList.search(locationData, gear, dateRange, function(searchResults) {
							view.populateSearchBlock(searchResults);
							view.renderMap();
						});
					}
					else {
						console.log('Error geocoding: ' + status);
						alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
						view.populateSearchBlock([]);
						view.renderMap();
					}
				});
			}

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
		};

		/**
		 * Generate the search results HTML and insert it into the search results block.
		 * @param searchResults: an array of objects.
		 */
		populateSearchBlock = function(searchResults, callback) {
            var view = this,
            	$searchBlock = $('#' + searchBlockID, this.$element);

            //Remove promo block and billboard
			$('#home-promo-block', view.$element).css({
				display: 'none'
			});
			$('.billboard-how-it-works', view.$element).css({
				display: 'none'
			});

			$searchBlock.empty();

            if (searchResults.length <= 0) {
				$('#home-search-block #testRow', view.$element).empty();
            	$('#home-search-block .no-results-block', view.$element).show();
				return;
			}

            $('#home-search-block .no-results-block', view.$element).hide();

			require(['text!../templates/search-results.html'], function(SearchResultTemplate) {
				var searchResultTemplate = _.template(SearchResultTemplate),
					defaultSearchResults, searchResult, imagesTest, i, img;

				defaultSearchResults = {
					id: 0,
					gear_type: 0,
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

					img = new Image();
					img.src = searchResult.image;

					if(img.width < img.height) {
						$searchBlock.children().eq(i).children(':first').addClass('search-result-gear-vertical');
					}
					else {
						$searchBlock.children().eq(i).children(':first').addClass('search-result-gear-horizontal');
					}

				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			renderMap: renderMap,

			performSearch: performSearch,
			populateSearchBlock: populateSearchBlock
		});
	}
);