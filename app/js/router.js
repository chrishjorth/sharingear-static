/**
 * Handles routing.
 * @author: Chris Hjorth
 */

define(
	['jquery'],
	function($) {
		var Router;

		Router = {
			routes: ['error'], //The default error route must always be present for error handling
			currentViewController: null,
			currentModalViewController: null,
			mainViewContainer: '.view-container',
			modalViewLightbox: '.modal-view-lightbox',
			modalViewContainer: '.modal-view-container',
			hashUpdated: false,

			addRoutes: addRoutes,
			getRoute: getRoute,
			routeExists: routeExists,
			navigateTo: navigateTo,
			loadView: loadView,
			openModalView: openModalView,
			loadModalView: loadModalView,
			closeModalView: closeModalView
		};

		window.onhashchange = function(event) {
			/*if(Router.hashUpdated === true) {
				Router.hashUpdated = false;
				return;
			}*/
			var hash = window.location.hash.substring(1);
			if(hash === '') {
				hash = 'home';
			}
			Router.navigateTo(hash);
		};

		return Router;

		function addRoutes() {
			var i;
			for(i = 0; i < arguments.length; i++) {
				this.routes.push(arguments[i]);
			}
		}

		function navigateTo(route, callback) {
			var router = this;
			this.loadView(this.getRoute(route), route, function(error) {
				if(!error) {
					router.hashUpdated = true;
					window.location.hash = route;
				}
				if(callback && typeof callback === 'function') {
					callback(error);
				}
			});
		}

		/**
		 * Validates the route and returns error if route does not exist.
		 */
		function getRoute(route) {
			//Extract route root
			routeRoot = route.substring(0, route.indexOf('/'));
			if(routeRoot.length <= 0) {
				routeRoot = route;
			}

			if(this.routeExists(routeRoot) === false) {
				console.log("Error: no view for route '" + routeRoot + "'");
				routeRoot = 'error';
			}

			return routeRoot;
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
			//If the view is already loaded just update the path and call render subviews
			if(this.currentViewController !== null && this.currentViewController.name === view) {
				//We run the callback before proceeding to rendering the subviews
				if(callback && typeof callback === 'function') {
					callback();
				}
				this.currentViewController.path = path;
				this.currentViewController.setSubPath();
				this.currentViewController.renderSubviews();
				return;
			}
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				//Close the previous controller properly before loading a new one
				if(router.currentViewController !== null) {
					router.currentViewController.close();
				}
				router.currentViewController = new ViewController({name: view, $element: $(router.mainViewContainer), labels: {}, template: ViewTemplate, path: path});
				//The ready property is so a controller can abort loading, useful if a redirect is being called
				if(router.currentViewController.ready === true) {
					router.currentViewController.render(function() {
						//We run the callback before proceeding to rendering the subviews
						if(callback && typeof callback === 'function') {
							callback(null);
						}
						router.currentViewController.renderSubviews();
					});
				}
				else {
					if(callback && typeof callback === 'function') {
						callback({error: 'Load aborted'});
					}
				}
			});
		}

		function openModalView(route, callback) {
			this.loadModalView(this.getRoute(route), route, callback);
		}

		function loadModalView(view, path, callback) {
			var router = this;
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				var $modalViewLightbox = $(router.modalViewLightbox),
					$modalViewContainer = $(router.modalViewContainer);

				if(router.currentModalViewController !== null) {
					router.currentModalViewController.close();
				}

				if($modalViewLightbox.hasClass('hidden') === true) {
					$modalViewLightbox.removeClass('hidden');
				}

				router.currentModalViewController = new ViewController({name: view, $element: $modalViewContainer, labels: {}, template: ViewTemplate, path: path});
				if(router.currentModalViewController.ready === true) {
					router.currentModalViewController.render();
				}
				
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function closeModalView(callback) {
			var $modalViewLightbox = $(this.modalViewLightbox);

			if(this.currentModalViewController !== null) {
				this.currentModalViewController.close();
				//this.currentModalViewController = null;
			}
			if($modalViewLightbox.hasClass('hidden') === false) {
				$modalViewLightbox.addClass('hidden');
			}

			if(callback && typeof callback === 'function') {
				callback();
			}
		}
	}
);