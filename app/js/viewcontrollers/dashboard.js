/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {
		var Dashboard = Utilities.inherit(ViewController, {
			didRender: didRender
		});

		return Dashboard;

		function didRender() {
			console.log('Dashboard did render with path: ' + this.path);
		}
	}
);