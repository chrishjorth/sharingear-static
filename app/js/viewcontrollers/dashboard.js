/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {
		var Dashboard = Utilities.inherit(ViewController, {
			subViewContainerID: 'dashboard-subview-container',
			$subViewContainer: $(''),
			subPath: '',
			currentSubViewController: null,

			didInitialize: didInitialize,
			didRender: didRender,
			loadSubView: loadSubView
		});

		return Dashboard;

		function didInitialize() {
			if(this.path === 'dashboard') {
				this.path = 'dashboard/profile';
			}
			this.subPath = this.path.substring(this.path.indexOf('/') + 1);
		}

		function didRender(callback) {
			this.$subViewContainer = $('#' + this.subViewContainerID);
			this.loadSubView(callback);
		}

		function loadSubView(callback) {
			var dashboard = this;
			require(['viewcontrollers/dashboard-' + dashboard.subPath, 'text!../templates/dashboard-' + dashboard.subPath + '.html'], function(SubViewController, SubViewTemplate) {
				if(dashboard.currentSubViewController !== null) {
					dashboard.currentSubViewController.close();
				}
				dashboard.currentSubViewController = new SubViewController({name: dashboard.subPath, $element: dashboard.$subViewContainer, labels: {}, template: SubViewTemplate, path: dashboard.path});
				dashboard.currentSubViewController.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);