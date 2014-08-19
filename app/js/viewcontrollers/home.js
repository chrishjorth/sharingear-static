/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller'],
	function(_, ViewController) {
		var Home = ViewController;

		_.extend(Home.prototype, {
			didRender: didRender
		});

		return Home;

		function didRender() {
			//Setup event for search button
		}
	}
);