/**
 * Controller for the Sharingear header with navigation view.
 * @author: Chris Hjorth
 */

define(
	['utilities', 'viewcontroller', 'app'],
	function(Utilities, ViewController, App) {
		var Header = Utilities.inherit(ViewController, {
			didRender: didRender,
			handleLogin: handleLogin
		});

		return Header;

		function didRender() {
			this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
		}

		function handleLogin(event, callback) {
			var user = App.user;
			user.login(function() {
				App.router.navigateTo('dashboard');
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);