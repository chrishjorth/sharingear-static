/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller', 'app'],
	function(_, Utilities, ViewController, App) {
		var Dashboard = Utilities.inherit(ViewController, {
			subViewContainerID: 'dashboard-subview-container',
			$subViewContainer: $(''),
			subPath: '',
			currentSubViewController: null,

			didInitialize: didInitialize,
			didRender: didRender
		});

		return Dashboard;

		function didInitialize() {
			if(App.user.data === null) {
				this.ready = false;
				App.router.navigateTo('home');
				return;
			}

			if(this.path === 'dashboard') {
				App.router.navigateTo('dashboard/profile');
			}
		}

		function didRender(callback) {
			this.$subViewContainer = $('#' + this.subViewContainerID);
		}

		
	}
);