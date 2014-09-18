/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {
		var GearProfile = Utilities.inherit(ViewController, {
			didRender: didRender
		});

		return GearProfile;

		function didRender() {
			
		}
	}
);

