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

		function didRender() {
			this.$subViewContainer = $(this.subViewContainerID);
			this.loadSubView();
		}

		function loadSubView(callback) {
			var router = this;
			require(['text!../templates/dashboard-' + router.subPath + '.html'], function(SubViewTemplate) {
				var template = _.template(SubViewTemplate);
				router.$subViewContainer.html(template());
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);