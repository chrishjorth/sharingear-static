/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller', 'app'],
	function(_, Utilities, ViewController, App) {
		var Profile = Utilities.inherit(ViewController, {
			didInitialize: didInitialize
		}); 
		return Profile;

		function didInitialize() {
			//We need default values so the templating does not fail.
			var user = {
				name: '',
				hometown: '',
				bio: '',
				genres: ''
			};

			_.extend(user, App.user.data);
			
			this.templateParameters = user;
		}
	}
);