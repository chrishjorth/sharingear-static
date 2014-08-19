/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {

		var Home = Utilities.inherit(ViewController, {
			didRender: didRender,
			setupEvents: setupEvents,
			handleSearch: handleSearch
		});

		return Home;

		function didRender() {
			this.setupEvents();
		}

		function setupEvents() {
			this.setupEvent('submit', '#home-search-form', this, this.handleSearch);
		}

		function handleSearch() {
			console.log('Search');
			return false;
		}
	}
);