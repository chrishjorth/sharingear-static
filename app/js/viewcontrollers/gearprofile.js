/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'galleria'],
	function(ViewController, Galleria) {
		var GearProfile = ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender
		});

		return GearProfile;

		function didInitialize() {
			Galleria.loadTheme('js/libraries/galleria_themes/classic/galleria.classic.js');
			
		}

		function didRender() {
			Galleria.run('.galleria');
		}
	}
);

