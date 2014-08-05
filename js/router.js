/**
 * Handles routing.
 * @author: Chris Hjorth
 */

define(
	['jquery'],
	function($) {
		var Router, routes;

		routes = ['error'];

		Router = {
			addRoutes: addRoutes,
			navigateTo: navigateTo,
			routeExists: routeExists,
			loadView: loadView,
			routes: ['error'],
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

		function navigateTo(route) {
			var view = route;
			if(this.routeExists(route) === false) {
				view = 'error';
			}

			this.loadView(view);
		}

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

		function loadView(view) {
			var router = this;
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				if(router.currentViewController !== null) {
					router.currentViewController.close();
				}
				router.currentViewController = new ViewController({$element: $(router.mainViewContainer), labels: {}, template: ViewTemplate});
				router.currentViewController.render();
			});
		}
	}
);