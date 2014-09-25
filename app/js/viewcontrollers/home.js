/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'models/gearlist', 'app', 'googlemaps'],
	function(_, ViewController, GearList, App, GoogleMaps) {

		var Home = ViewController.inherit({
			gearList: new GearList.constructor({
				rootURL: App.API_URL
			}),
			geocoder: new GoogleMaps.Geocoder(),

			searchBlockID: 'home-search-block',
			didRender: didRender,
			setupEvents: setupEvents,
			handleSearch: handleSearch,
			populateSearchBlock: populateSearchBlock
		});

		return Home;

		function didRender() {
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
					console.log(locationData);
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
					defaultSearchResults, searchResult, i;

				defaultSearchResults = {
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: '',
					description: '',
					photos: '',
					price: 0,
					seller_user_id: 0,
					city: '',
					address: '',
					price1: 0,
					price2: 0,
					price3: 0
				};

				for(i = 0; i < searchResults.length; i++) {
					searchResult = searchResults[i];
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