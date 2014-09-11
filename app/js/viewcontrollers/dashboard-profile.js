/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app'],
	function(_, ViewController, App) {
		var Profile = ViewController.inherit({
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