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

		function run() {
			var app = this,
				router = this.router,
				hash = '';

			router.addRoutes('home');

			$(document).ready(function() {
				//Load header and footer
				app.loadHeader();

				//Load initial page
				hash = window.location.hash;
				if(hash.length > 0) {
					router.navigateTo(hash.substring(1));
				}
				else {
					router.navigateTo('home');
				}

				//TODO: Make the router implement HTML5 history push pop

				app.loadFooter();
			});

			console.log('Sharingear initialized.');
		}

		function loadHeader() {
			var header = this.header;
			require(['viewcontrollers/navigation-header', 'text!../templates/navigation-header.html'], function(HeaderController, HeaderTemplate) {
				header = new HeaderController({$element: $('.navigation-header'), labels: {}, template: HeaderTemplate});
				header.render();
			});
		}

		function loadFooter() {
			var footer = this.footer;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				footer = new FooterController({$element: $('.footer'), labels: {}, template: FooterTemplate});
				footer.render();
			});
		}
	}
);