/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller'],
	function(_, ViewController) {
		var Dashboard = ViewController;

		_.extend(Dashboard.prototype, {
			didRender: didRender
		});

		return Dashboard;

		function didRender() {
			console.log('Dashboard did render with path: ' + this.path);
		}
	}
);