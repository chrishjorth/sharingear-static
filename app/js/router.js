/**
 * Handles routing.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery'],
	function($) {
		var Router,
			addRoutes,
			getRoute,
			routeExists,
			handleHashChange,
			navigateTo,
			loadView,
			openModalView,
			loadModalView,
			closeModalView,
			setQueryString;

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
		 * 		For this reason we need a semaphore to avoid views being loaded twice, since we updated the hash in the case of a navigateTo call.
		 */
		handleHashChange = function() {
			//Handle semaphore
			if(Router.navigateToViewCalled === false){
				//Origin of event is URL or
				// direct link
				Router.hashUpdated = true;
				Router.navigateTo(window.location.hash.substring(1), null);
			}
			else {
				//Origin of event is navigateTo
				Router.navigateToViewCalled = false;
			}
		};

		navigateTo = function(route, data, callback) {
            var router = this,
            	queryIndex;
			if(router.hashUpdated === false) {
				//Hash change event not fired
				//We only change hash if the current one does not match the route, to avoid giving the semaphore a wrong state
				if(window.location.hash !== '#' + route) {
					router.navigateToViewCalled = true;
					window.location.hash = '#' + route; //This triggers handleHashChange, which is why we set the semaphores so that navigateTo is not called again
				}
			}
			else {
				//Hash change event fired
				router.hashUpdated = false;
			}

			//Strip querystring from route
			queryIndex = route.indexOf('?');
			if(queryIndex >= 0) {
				route = route.substring(0, queryIndex);
			}

			this.loadView(this.getRoute(route), route, data, function(error) {
				if(callback && typeof callback === 'function') {
					callback(error);
				}
			});
		};

		/**
		 * Note that a path for a subviews could also simply be a content reference, fx gear/1
		 */
		loadView = function(view, path, data, callback) {
			var router = this;
			//If the view is already loaded just update the path and call render subviews
			if(this.currentViewController !== null && this.currentViewController.name === view && this.currentViewController.hasSubviews === true) {
				this.currentViewController.path = path;
				this.currentViewController.setSubPath();
				//We run the callback before proceeding to rendering the subviews
				if(callback && typeof callback === 'function') {
					callback();
				}
				this.currentViewController.renderSubviews(data);
				return;
			}
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				//Close the previous controller properly before loading a new one
				if(router.currentViewController !== null) {
					router.currentViewController.close();
				}
				router.currentViewController = new ViewController.constructor({name: view, $element: $(router.mainViewContainer), labels: {}, template: ViewTemplate, path: path, passedData: data});
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
		};

		openModalView = function(route, data, callback) {
			this.loadModalView(this.getRoute(route), route, data, callback);
		};

		loadModalView = function(view, path, data, callback) {
			var router = this;
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				var $modalViewLightbox = $(router.modalViewLightbox),
					$modalViewContainer = $(router.modalViewContainer);

				if(router.currentModalViewController !== null) {
					router.currentModalViewController.close();
				}

				if($modalViewLightbox.hasClass('hidden') === true) {
					$modalViewLightbox.removeClass('hidden');
					$('body').addClass('modal-open');
				}

				router.currentModalViewController = new ViewController.constructor({name: view, $element: $modalViewContainer, labels: {}, template: ViewTemplate, path: path, passedData: data});
				if(router.currentModalViewController.ready === true) {
					router.currentModalViewController.render();
				}
				
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		closeModalView = function(callback) {
			var router = this,
				$modalViewLightbox = $(this.modalViewLightbox);

			if(this.currentModalViewController !== null) {
				this.currentModalViewController.close();
				//this.currentModalViewController = null;
			}
			if($modalViewLightbox.hasClass('hidden') === false) {
				$modalViewLightbox.addClass('hidden');
				$('body').removeClass('modal-open');
			}

			//Render the underlying view again so that data gets updated
			this.currentViewController.initialize();
			this.currentViewController.render(function() {
				router.currentViewController.renderSubviews();
			});

			if(callback && typeof callback === 'function') {
				callback();
			}
		};

		setQueryString = function(queryString) {
			var hash = window.location.hash,
				newLocation;
			if(!queryString || queryString === '') {
				newLocation = window.location.pathname + hash;
				history.replaceState({}, '', newLocation);
				return;
			}
			this.navigateToViewCalled = true;
			window.location.hash += '?' + queryString;
		};

		window.onhashchange = handleHashChange;

		Router = {
			routes: ['error'], //The default error route must always be present for error handling
			currentViewController: null,
			currentModalViewController: null,
			mainViewContainer: '.view-container',
			modalViewLightbox: '.modal-view-lightbox',
			modalViewContainer: '.modal-view-container',
			hashUpdated: false, //Semaphore variable
			navigateToViewCalled: false, //Semaphore variable

			addRoutes: addRoutes,
			getRoute: getRoute,
			routeExists: routeExists,
			handleHashChange: handleHashChange,
			navigateTo: navigateTo,
			loadView: loadView,
			openModalView: openModalView,
			loadModalView: loadModalView,
			closeModalView: closeModalView,
			setQueryString: setQueryString
		};
		return Router;
	}
);