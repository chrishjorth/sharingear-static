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
			var $buttonsRightContainer = $('#navigationheader-buttonsright', this.$element),
				html = '';
			if(App.user.data.id === null) {
				html += '<li class="_button-1"><a href="javascript:;" id="navigation-header-signup">SIGN UP</a></li>';
				html += '<li class="_button-2"><a href="javascript:;" id="navigation-header-login">LOG IN</a></li>';
				html += '<li class="active _button-3"><a href="#listyourgear">LIST YOUR GEAR</a></li>';
				$buttonsRightContainer.html(html);

				this.setupEvent('click', '#navigation-header-signup', this, this.handleLogin);
				this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
			}
			else {
				html += '<li class="_button-1"><a href="#dashboard">DASHBOARD</a></li>';
				$buttonsRightContainer.html(html);
			}
		}

		function handleLogin(event, callback) {
			var view = event.data,
				user = App.user;
			user.login(function(error) {
				if(!error) {
					App.router.navigateTo('dashboard');
				}
				view.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);