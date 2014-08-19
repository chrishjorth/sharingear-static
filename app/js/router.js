/**
 * Handles routing.
 * @author: Chris Hjorth
 */

define(
	['jquery'],
	function($) {
		var Router;

		Router = {
			addRoutes: addRoutes,
			navigateTo: navigateTo,
			routeExists: routeExists,
			loadView: loadView,
			routes: ['error'], //The default error route must always be present for error handling
			currentViewController: null,
			mainViewContainer: '.view-container'
		};

		window.onhashchange = function() {
			Router.navigateTo(window.location.hash.substring(1));
		};

		return Router;

		function addRoutes() {
			var i;
			for(i = 0; i < arguments.length; i++) {
				this.routes.push(arguments[i]);
			}
		}

		function navigateTo(route, callback) {
			var view = route,
				routeRoot;

			//Extract route root
			routeRoot = route.substring(0, route.indexOf('/'));
			if(routeRoot.length <= 0) {
				routeRoot = view;
			}

			if(this.routeExists(routeRoot) === false) {
				console.log("Error: no view for route '" + routeRoot + "'");
				routeRoot = 'error';
			}

			this.loadView(routeRoot, route, callback);
		}

		/**
		 * @return true if the route exists, false in all other cases.
		 */
		function routeExists(route) {
			var i = 0;
			while(i < this.routes.length) {
				if(route === this.routes[i]) {
					return true;
				}
				i++;
			}
			return false;
		}

		function loadView(view, path, callback) {
			var router = this;
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				if(router.currentViewController !== null) {
					router.currentViewController.close();
				}
				router.currentViewController = new ViewController({name: view, $element: $(router.mainViewContainer), labels: {}, template: ViewTemplate, path: path});
				router.currentViewController.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);