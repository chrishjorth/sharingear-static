/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

define(
	['jquery', 'router'],
	function($, Router) {
		var App = {
			router: Router,
			run: run
		};

		return App;

		function run() {
			var router = this.router,
				hash = '';

			router.addRoutes('home');

			$(document).ready(function() {
				hash = window.location.hash;
				if(hash.length > 0) {
					router.navigateTo(hash.substring(1));
				}
				else {
					router.navigateTo('home');
				}

				//TODO: Make the router implement HTML5 history push pop
			});

			console.log('Sharingear initialized.');
		}
	}
);