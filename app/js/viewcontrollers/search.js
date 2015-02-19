/**
 * Controller for the Sharingear Search view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'underscore', 'config', 'viewcontroller', 'app', 'googlemaps', 'models/gearlist', 'models/localization', 'facebook'],
	function($, _, Config, ViewController, App, GoogleMaps, GearList, Localization, FB) {
		var searchBlockID = 'home-search-row',
			geocoder,
			
			didInitialize,
			didRender,
			renderMap,
			setCurrentLocation,

			performSearch,
			populateSearchBlock;

		//Static variables
		geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			this.searchFormVC = null;

			this.gearList = new GearList.constructor({
				rootURL: Config.API_URL
			});
			this.gearList.initialize();

			this.latitude = 0.0;
			this.longitude = 0.0;
		};

		didRender = function() {
			var view = this,
				searchParameters;

			if(App.header) {
                App.header.setTitle('Search gear');
            }

			if(this.searchFormVC === null) {
				require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
					view.searchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('.searchform-container', view.$element), template: gearSearchVT});
					view.searchFormVC.initialize();
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

		renderMap = function(searchResults, latitude, longitude) {
			var mapOptions, latlong, i, gear;

			if(!latitude || !longitude) {
				latlong = new GoogleMaps.LatLng(40.746227, 14.656527);
				mapOptions = {
					center: latlong,
					zoom: 2,
					maxZoom: 14
				};
			}
			else {
				latlong = new GoogleMaps.LatLng(latitude, longitude);
				mapOptions = {
					center: latlong,
					zoom: 12,
					maxZoom: 14
				};
			}

			//draw map
			this.map = new GoogleMaps.Map(document.getElementById('search-map'), mapOptions);

			//add markers based on search results
			for(i = 0; i < searchResults.length; i++) {
				gear = searchResults[i].data;
				latlong = new GoogleMaps.LatLng(gear.latitude, gear.longitude);
				searchResults[i].marker = new GoogleMaps.Marker({
					position: latlong,
					map: this.map,
					icon: 'images/map_pin.png'
				});
			}
		};

		setCurrentLocation = function(location) {
			if(location === 'all' || location === '') {
				location = 'the world';
			}
			$('#search-currentlocation', this.$element).html('Showing gear near ' + location);
		};

		performSearch = function(gear, location, dateRange) {
			var view = this;
			
			App.user.setSearchInterval(dateRange);
			if(location === '' || location === 'all' || location === null) {
				location = 'all';
				view.gearList.search(location, gear, dateRange, function(searchResults) {
					view.populateSearchBlock(searchResults);
					view.renderMap(searchResults);
					view.setCurrentLocation(location);
				});
			}
			else {
				geocoder.geocode({address: location}, function(results, status) {
					var locationData;
					if(status === GoogleMaps.GeocoderStatus.OK) {
						locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
						view.gearList.search(locationData, gear, dateRange, function(searchResults) {
							view.populateSearchBlock(searchResults);
							view.renderMap(searchResults, results[0].geometry.location.lat(), results[0].geometry.location.lng());
							view.setCurrentLocation(results[0].formatted_address);
						});
					}
					else {
						console.log('Error geocoding: ' + status);
						alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
						view.populateSearchBlock([]);
						view.renderMap([]);
						view.setCurrentLocation(location);
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
            	$searchBlock = $('#' + searchBlockID, this.$element),
            	$noResultsBlock;

            //Remove promo block and billboard
			$('#home-promo-block', view.$element).css({
				display: 'none'
			});
			$('.billboard-how-it-works', view.$element).css({
				display: 'none'
			});

			$searchBlock.empty();
			$noResultsBlock = $('.no-results-block', this.$element);

            if (searchResults.length <= 0) {
            	$noResultsBlock.removeClass('hidden');
				return;
			}

			if($noResultsBlock.hasClass('hidden') === false) {
				$noResultsBlock.addClass('hidden');
			}

			require(['text!../templates/search-results.html'], function(SearchResultTemplate) {
				var searchResultTemplate = _.template(SearchResultTemplate),
					defaultSearchResults, handleImageLoad, handlePrices, html, searchResult, i, img;

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
					currency: App.user.data.currency,
					city: '',
					address: '',
					price_a: 0,
					price_b: 0,
					price_c: 0,
					owner_id: null
				};

				handleImageLoad = function() {
					var $result = $('#search-results-' + this.resultNum, $searchBlock);
					if(this.width < this.height) {
						$result.addClass('search-result-gear-vertical');
					}
					else {
						$result.addClass('search-result-gear-horizontal');
					}
					$result.css('background-image', 'url("' + this.src + '")');
				};

				handlePrices = function(resultNum) {
					var $price = $('#search-results-' + resultNum + ' .price_a', $searchBlock);
					Localization.convertPrices([searchResults[resultNum].data.price_a], searchResults[resultNum].data.currency, App.user.data.currency, function(error, convertedPrice) {
						if(error) {
							console.log('Could not convert price: ' + error);
							return;
						}
						$price.html(Math.ceil(convertedPrice));
					});
				};

				html = '';
				for(i = 0; i < searchResults.length; i++) {
					searchResult = searchResults[i].data;
                    searchResult.image = searchResult.images.split(',')[0];

                    if (searchResult.image === '') {
                        searchResult.image = 'images/placeholder_grey.png';
                    }
                    
                    searchResult.resultNum = i;

					_.extend(defaultSearchResults, searchResult);
					html += searchResultTemplate(defaultSearchResults);

					img = new Image();
					img.resultNum = i;
					img.onload = handleImageLoad;
					img.src = searchResult.image;
				}
				$searchBlock.append(html);

				//TODO: Optimize this to be included in previous loop, ie build search results in memory during loop.
				for(i = 0; i < searchResults.length; i++) {
					handlePrices(i);
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
			setCurrentLocation: setCurrentLocation,

			performSearch: performSearch,
			populateSearchBlock: populateSearchBlock
		});
	}
);