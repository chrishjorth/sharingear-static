/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var Dashboard = ViewController.inherit({
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
				this.ready = false; //We abort loading the view
				App.router.navigateTo('dashboard/profile');
			}
		}

		function didRender(callback) {
			this.$subViewContainer = $('#' + this.subViewContainerID);
		}

		
	}
);