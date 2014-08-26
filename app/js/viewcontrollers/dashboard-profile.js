/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {
		var Profile = Utilities.inherit(ViewController, {
			didInitialize: didInitialize
		}); 
		return Profile;

		function didInitialize() {
			this.templateParameters = {
				name: 'Chris Hjorth',
				hometown: 'Aalborg',
				bio: 'Blah blah',
				genres: ''
			};
		}
	}
);