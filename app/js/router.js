/**
 * Handles routing.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),

	ViewLoader = require('./viewloader.js'),
	Utilities = require('./utilities.js');

var Router,
			
	hashUpdated,

	getRoute,
	handleHashChange,
	navigateTo,
	canNavigateBack,
	navigateBack,
	openModalView,
	openModalSiblingView,
	closeModalView,
	setQueryString;
		
hashUpdated = false; //Semaphore variable

/**
 * Validates the route and returns error if route does not exist.
 */
getRoute = function(route) {
	//Extract route root
	var routeRoot = route.substring(0, route.indexOf('/'));
	if(routeRoot.length <= 0) {
		routeRoot = route;
	}

	return routeRoot;
};

/**
 * NOTE: This function is triggered when the hash in the URL changes, no matter wether it is by code or by user interaction.
 */
handleHashChange = function() {
	hashUpdated = true;
	console.log('Route: ' + window.location.hash.substring(2));
	Router.navigateTo(window.location.hash.substring(2)); //2 because we use hashbangs #!
};

navigateTo = function(route, data, callback) {
	var router = this,
		queryIndex, newLocation, queryString;
	if(hashUpdated === false) {
		//Hash change event not fired
		//We only change hash if the current one does not match the route, to avoid giving the semaphore a wrong state
		if(window.location.hash !== '#!' + route) {
			newLocation = window.location.pathname;
			queryString = Utilities.getQueryString();
			if(queryString) {
				newLocation += '?' + queryString;
			}
			newLocation += '#!' + route;
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

canNavigateBack = function() {
	return window.history.length > 1; //The length is the number of pages visited, if 1 then the user has only visited one page and hence there is no history to go back to
};

navigateBack = function() {
	window.history.back();
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

	getRoute: getRoute,
	handleHashChange: handleHashChange,
	navigateTo: navigateTo,
	canNavigateBack: canNavigateBack,
	navigateBack: navigateBack,
	openModalView: openModalView,
	openModalSiblingView: openModalSiblingView,
	closeModalView: closeModalView,
	setQueryString: setQueryString
};

window.onhashchange = Router.handleHashChange;

module.exports = Router;
