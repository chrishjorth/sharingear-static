/**
 * Controller for the Sharingear Search view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'underscore', 'config', 'viewcontroller', 'app', 'utilities', 'googlemaps', 'models/gearlist', 'models/vanlist', 'models/localization', 'facebook'],
	function($, _, Config, ViewController, App, Utilities, GoogleMaps, GearList, VanList, Localization, FB) {
		var gearSearchBlockID = 'search-results-gear',
			vanSearchBlockID = 'search-results-vans',
			geocoder,
			
			didInitialize,
			didRender,
			renderMap,
			setCurrentLocation,

			handleTab,
			handleFBShare,

			switchToTab,
			getCurrentTab,
			performGearSearch,
			performVanSearch,
			populateSearchBlock;

		//Static variables
		geocoder = new GoogleMaps.Geocoder();

		didInitialize = function() {
			this.gearSearchFormVC = null;
			this.vanSearchFormVC = null;

			this.gearList = new GearList.constructor({
				rootURL: Config.API_URL
			});
			this.gearList.initialize();

			this.vanList = new VanList.constructor({
				rootURL: Config.API_URL
			});
			this.vanList.initialize();

			this.latitude = 0.0;
			this.longitude = 0.0;
		};

		didRender = function() {
			var queryString;

			if(App.header) {
                App.header.setTitle('Search gear');
            }

            //Figure out current tab
            queryString = Utilities.getQueryString();
            if(queryString) {
            	if(Utilities.getQueryStringParameterValue(queryString, 'van')) {
            		this.switchToTab($('#search-tab-vans', this.$element));
            	}
            	else {
            		//Set to gear search
            		this.switchToTab($('#search-tab-gear', this.$element));
            	}
            }
            else {
            	//Set to gear search
            	this.switchToTab($('#search-tab-gear', this.$element));
            }

			this.setupEvent('click', '.sg-tabs .sg-btn-invisible', this, this.handleTab);
			this.setupEvent('click', '.fb-share-btn', this, this.handleFBShare);
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

		handleTab = function(event) {
			var view = event.data;
			view.switchToTab($(this));
		};

		handleFBShare = function(event) {
			var view = event.data,
				tab, item, searchParameters, description;

			tab = view.getCurrentTab();
			switch(tab) {
				case 'gear':
					searchParameters = view.gearSearchFormVC.getSearchParameters;
					item = searchParameters.gearString;
					break;
				case 'vans':
					searchParameters = view.vanSearchFormVC.getSearchParameters;
					item = searchParameters.vanString;
					break;
			}

			description = 'Hey, I am looking for a ' + item + ' near ' + searchParameters.locationString + ' - anyone? Help me out at www.sharingear.com, because I am willing to rent it from you!';
			
			FB.ui({
				method: 'feed',
				caption: 'Request ' + tab + ' on Sharingear!',
				link: 'sharingear.com',
				description: description
			}, function() {});
		};

		performGearSearch = function() {
			var view = this,
				performSearch, searchParameters;

			console.log('SEARCH GEAR');

			performSearch = function(gear, location, dateRange) {
				App.user.setSearchInterval(dateRange);
				if(location === '' || location === 'all' || location === null) {
					location = 'all';
					view.gearList.search(location, gear, dateRange, function(searchResults) {
						view.populateSearchBlock(searchResults, $('#' + gearSearchBlockID, view.$element));
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
								view.populateSearchBlock(searchResults, $('#' + gearSearchBlockID, view.$element));
								view.renderMap(searchResults, results[0].geometry.location.lat(), results[0].geometry.location.lng());
								view.setCurrentLocation(results[0].formatted_address);
							});
						}
						else {
							console.log('Error geocoding: ' + status);
							alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
							view.populateSearchBlock([], $('#' + gearSearchBlockID, view.$element));
							view.renderMap([]);
							view.setCurrentLocation(location);
						}
					});
				}
			};

			if(this.gearSearchFormVC === null) {
				require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
					view.gearSearchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('#search-searchform-gear .searchform-container', view.$element), template: gearSearchVT});
					view.gearSearchFormVC.initialize();
					view.gearSearchFormVC.render();
					searchParameters = view.gearSearchFormVC.getSearchParameters();
					performSearch(searchParameters.gearString, searchParameters.locationString, searchParameters.dateRangeString);
				});
			}
			else {
				searchParameters = view.gearSearchFormVC.getSearchParameters();
				performSearch(searchParameters.gearString, searchParameters.locationString, searchParameters.dateRangeString);
			}
		};

		performVanSearch = function() {
			var view = this,
				performSearch, searchParameters;

			performSearch = function(vans, location, dateRange) {
				App.user.setSearchInterval(dateRange);
				if(location === '' || location === 'all' || location === null) {
					location = 'all';
					view.vanList.search(location, vans, dateRange, function(searchResults) {
						view.populateSearchBlock(searchResults, $('#' + vanSearchBlockID, view.$element));
						view.renderMap(searchResults);
						view.setCurrentLocation(location);
					});
				}
				else {
					geocoder.geocode({address: location}, function(results, status) {
						var locationData;
						if(status === GoogleMaps.GeocoderStatus.OK) {
							locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
							view.vanList.search(locationData, vans, dateRange, function(searchResults) {
								view.populateSearchBlock(searchResults, $('#' + vanSearchBlockID, view.$element));
								view.renderMap(searchResults, results[0].geometry.location.lat(), results[0].geometry.location.lng());
								view.setCurrentLocation(results[0].formatted_address);
							});
						}
						else {
							console.log('Error geocoding: ' + status);
							alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
							view.populateSearchBlock([], $('#' + vanSearchBlockID, view.$element));
							view.renderMap([]);
							view.setCurrentLocation(location);
						}
					});
				}
			};

			if(this.vanSearchFormVC === null) {
				require(['viewcontrollers/vansearchform', 'text!../templates/vansearchform.html'], function(vanSearchVC, vanSearchVT) {
					view.vanSearchFormVC = new vanSearchVC.constructor({name: 'vansearchform', $element: $('#search-searchform-vans .searchform-container', view.$element), template: vanSearchVT});
					view.vanSearchFormVC.initialize();
					view.vanSearchFormVC.render();
					searchParameters = view.vanSearchFormVC.getSearchParameters();
					performSearch(searchParameters.vanString, searchParameters.locationString, searchParameters.dateRangeString);
				});
			}
			else {
				searchParameters = view.vanSearchFormVC.getSearchParameters();
				performSearch(searchParameters.gearString, searchParameters.locationString, searchParameters.dateRangeString);
			}
		};

		switchToTab = function($tabButton) {
			var id = $tabButton.attr('id'),
				tab;

			//Remove this once technicians are enabled.
			if(id === 'search-tab-technicians') {
				if(App.user.isLoggedIn() === false) {
					this.handleLogin();
				}
				else {
					alert('This feature will be enabled soon, please stay tuned.');
				}
				return;
			}

			$('.sg-tabs li', this.$element).removeClass('active');
			$tabButton.parent().addClass('active');

			$('.sg-tab-panel', this.$element).each(function() {
				var $panel = $(this);
				if($panel.hasClass('hidden') === false) {
					$panel.addClass('hidden');
				}
			});
			tab = id.substring(11); //11 is the length of 'search-tab-'
			$('#search-searchform-' + tab, this.$element).removeClass('hidden');

			switch(tab) {
				case 'gear':
					this.performGearSearch();
					break;
				case 'vans':
					this.performVanSearch();
					break;
			}
		};

		getCurrentTab = function() {
			return $('.sg-tabs .active .sg-btn-invisible', this.$element).attr('id').substring(11); //11 is the length of 'search-tab-'
		};

		/**
		 * Generate the search results HTML and insert it into the search results block.
		 * @param searchResults: an array of objects.
		 */
		populateSearchBlock = function(searchResults, $searchBlock, callback) {
            var view = this,
            	$noResultsBlocks;

            $('.searchresults', view.$element).each(function() {
            	var $this = $(this);
            	if($this.hasClass('hidden') === false) {
            		$this.addClass('hidden');
            	}
            });

            if (searchResults.length <= 0) {
            	console.log('#no-results-' + view.getCurrentTab());
            	$('.no-results-' + view.getCurrentTab(), view.$element).removeClass('hidden');
				return;
			}

			$searchBlock.removeClass('hidden');
			$searchBlock.empty();

			$noResultsBlocks = $('.no-results', view.$element);
			if($noResultsBlocks.hasClass('hidden') === false) {
				$noResultsBlocks.addClass('hidden');
			}

			require(['text!../templates/search-results.html'], function(SearchResultTemplate) {
				var searchResultTemplate = _.template(SearchResultTemplate),
					defaultSearchResults, workingSearchResults, handleImageLoad, handlePrices, html, searchResult, i, img;

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
						$('.currency', $searchBlock).html(App.user.data.currency);
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

                    workingSearchResults = {};
					_.extend(workingSearchResults, defaultSearchResults, searchResult);
					html += searchResultTemplate(workingSearchResults);

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

			handleTab: handleTab,
			handleFBShare: handleFBShare,

			switchToTab: switchToTab,
			getCurrentTab: getCurrentTab,
			performGearSearch: performGearSearch,
			performVanSearch: performVanSearch,
			populateSearchBlock: populateSearchBlock
		});
	}
);