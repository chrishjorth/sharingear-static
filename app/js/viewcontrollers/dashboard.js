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
			loadSubView: loadSubView,
			getSubviewParameters: getSubviewParameters,
			getProfileParameters: getProfileParameters
		});

		return Dashboard;

		function didInitialize() {
			if(this.path === 'dashboard') {
				this.path = 'dashboard/profile';
			}
			this.subPath = this.path.substring(this.path.indexOf('/') + 1);
		}

		function didRender() {
			this.$subViewContainer = $('#' + this.subViewContainerID);
			this.loadSubView();
		}

		function loadSubView(callback) {
			var router = this;
			require(['text!../templates/dashboard-' + router.subPath + '.html'], function(SubViewTemplate) {
				var template = _.template(SubViewTemplate);
				router.$subViewContainer.html(template(router.getSubviewParameters(router.subPath)));
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function getSubviewParameters(subView) {
			var parameters = {};
			switch(subView) {
				case 'profile':
					parameters = this.getProfileParameters();
					break;
			}
			return parameters;
		}

		function getProfileParameters() {
			var profileParameters = {
				name: 'Chris Hjorth',
				hometown: 'Aalborg',
				bio: 'Blah blah',
				genres: ''
			};
			return profileParameters;
		}
	}
);