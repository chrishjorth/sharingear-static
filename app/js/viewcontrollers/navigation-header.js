/**
 * Controller for the Sharingear header with navigation view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var Header = ViewController.inherit({
			didRender: didRender,
			handleLogin: handleLogin
		});

		return Header;

		function didRender() {
			this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
		}

		function handleLogin(event, callback) {
			var user = App.user;
			user.login(function(error) {
				if(!error) {
					App.router.navigateTo('dashboard');
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);