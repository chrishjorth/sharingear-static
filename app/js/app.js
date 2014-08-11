/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

define(
	['jquery', 'router'],
	function($, Router) {
		var App = {
			router: Router,
			header: null,
			footer: null,
			run: run,
			loadHeader: loadHeader,
			loadFooter: loadFooter
		};

		return App;

		/**
		 * Initializes the app, that is:
		 * - Navigate to correct initial route
		 * - Call load header
		 * - Call load router
		 * @param callback: A function that will be called once the app is initialized.
		 */
		function run(callback) {
			var app = this,
				router = this.router,
				hash = '';

			router.addRoutes('home');

			$(document).ready(function() {
				var route = null;

				//Load header and footer
				app.loadHeader();

				//Load initial page
				hash = window.location.hash;
				if(hash.length > 0) {
					route = hash.substring(1);
				}
				else {
					route = 'home';
				}

				router.navigateTo(route, callback);

				//TODO: Make the router implement HTML5 history push pop

				app.loadFooter();
			});

			console.log('Sharingear initialized.');
		}

		/**
		 * Loads the header portion of the site. The header contains Sharingear's main navigation and is the same across the app.
		 */
		function loadHeader(callback) {
			var header = this.header;
			require(['viewcontrollers/navigation-header', 'text!../templates/navigation-header.html'], function(HeaderController, HeaderTemplate) {
				header = new HeaderController({$element: $('.navigation-header'), labels: {}, template: HeaderTemplate});
				header.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		/**
		 * Load the footer portion of the site.
		 */
		function loadFooter(callback) {
			var footer = this.footer;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				footer = new FooterController({$element: $('.footer'), labels: {}, template: FooterTemplate});
				footer.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);