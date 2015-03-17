/**
 * Handles routing.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewloader', 'utilities'],
	function(_, $, ViewLoader, Utilities) {
		var Router,
			
			hashUpdated,

			addRoutes,
			getRoute,
			routeExists,
			handleHashChange,
			navigateTo,
			openModalView,
			openModalSiblingView,
			closeModalView,
			setQueryString;
		
		hashUpdated = false; //Semaphore variable

		addRoutes = function() {
			var i;
			for(i = 0; i < arguments.length; i++) {
				this.routes.push(arguments[i]);
			}
		};

		/**
		 * Validates the route and returns error if route does not exist.
		 */
		getRoute = function(route) {
			//Extract route root
			var routeRoot = route.substring(0, route.indexOf('/'));
			if(routeRoot.length <= 0) {
				routeRoot = route;
			}

			if(this.routeExists(routeRoot) === false) {
				console.log('Error: no view for route "' + routeRoot + '".');
				routeRoot = 'error';
			}

			return routeRoot;
		};

		/**
		 * @return true if the route exists, false in all other cases.
		 */
		routeExists = function(route) {
			var i = 0;
			while(i < this.routes.length) {
				if(route === this.routes[i]) {
					return true;
				}
				i++;
			}
			return false;
		};

		/**
		 * NOTE: This function is triggered when the hash in the URL changes, no matter wether it is by code or by user interaction.
		 */
		handleHashChange = function() {
			hashUpdated = true;
			Router.navigateTo(window.location.hash.substring(1));
		};

		navigateTo = function(route, data, callback) {
            var router = this,
            	queryIndex, newLocation, queryString;
			if(hashUpdated === false) {
				//Hash change event not fired
				//We only change hash if the current one does not match the route, to avoid giving the semaphore a wrong state
				if(window.location.hash !== '#' + route) {
					newLocation = window.location.pathname;
					queryString = Utilities.getQueryString();
					if(queryString) {
						newLocation += '?' + queryString;
					}
					newLocation += '#' + route;
					history.pushState({}, '', newLocation); //This is to avoid calling handleHashChange by setting window.location.hash directly
				}
			}
			else {
				//Hash change event fired
				hashUpdated = false;
			}

			//Strip querystring from route
			queryIndex = route.indexOf('?');
			if(queryIndex >= 0) {
				route = route.substring(0, queryIndex);
			}

			ViewLoader.loadView(this.getRoute(route), route, data, function(error, loadedViewController) {
				if(!error) {
					router.currentViewController = loadedViewController;
				}
				if(_.isFunction(callback)) {
					callback();
				}
			});
		};

		openModalView = function(route, data, callback) {
			var router = this,
				view = this.getRoute(route);
			
			ViewLoader.loadModalView(view, route, data, function(error, loadedViewController) {
				if(!error) {
					router.currentModalViewController = loadedViewController;
				}
				if(_.isFunction(callback)) {
					callback();
				}
			});
		};

		/**
		 * Opens a modal view by closing any current open modals.
		 */
		openModalSiblingView = function(route, data, callback) {
			var router = this,
				view = this.getRoute(route);

			ViewLoader.loadModalViewSibling(view, route, data, function(error, loadedViewController) {
				if(!error) {
					router.currentModalViewController = loadedViewController;
				}
				if(_.isFunction(callback)) {
					callback();
				}
			});
		};

		closeModalView = function(callback) {
			var router = this;
			ViewLoader.closeModalView(function(error, currentModalViewController) {
				if(!error) {
					router.currentModalViewController = currentModalViewController;
				}
				if(_.isFunction(callback)) {
					callback();
				}
			});
		};

		setQueryString = function(queryString) {
			var hash = window.location.hash,
				newLocation;
			if(!queryString || queryString === '') {
				newLocation = window.location.pathname + hash;
			}
			else {
				newLocation = window.location.pathname + '?' + queryString + hash;
			}
			history.replaceState({}, '', newLocation);
		};

		Router = {
			routes: ['error'], //The default error route must always be present for error handling
			currentViewController: null,
			currentModalViewController: null,
			viewLoader: ViewLoader,

			addRoutes: addRoutes,
			getRoute: getRoute,
			routeExists: routeExists,
			handleHashChange: handleHashChange,
			navigateTo: navigateTo,
			openModalView: openModalView,
			openModalSiblingView: openModalSiblingView,
			closeModalView: closeModalView,
			setQueryString: setQueryString
		};

		window.onhashchange = Router.handleHashChange;

		return Router;
	}
);