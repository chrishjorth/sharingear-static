/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'router', 'utilities', 'models/user', 'models/gearclassification', 'models/localization'],
	function(_, $, Config, Router, Utilities, User, GearClassification) {
		var App,

			run,
			setUserLocation,
			loadHeader,
			getCookie,

			$headerContainer, $footerContainer;

		$headerContainer = $('.navigation-header');
		$footerContainer = $('.footer');

		/**
		 * Initializes the app, that is:
		 * - Navigate to correct initial route
		 * - Call load header
		 * - Call load router
		 * @param callback: A function that will be called once the app is initialized.
		 */
		run = function(callback) {
			var router = this.router,
				loginDeferred = $.Deferred(),
				documentReadyDeferred = $.Deferred();

			router.addRoutes(
				'home',
				'dashboard',
				'dashboard/profile',
				'dashboard/yourgear',
				'dashboard/yourrentals',
				'dashboard/yourreservations',
				'dashboard/settings',
				'addgear',
				'gearprofile',
				'aboutus',
				'contactus',
				'terms',
				'copyright',
				'privacy',
				'editgear',
				'gearbooking',
				'gearavailability',
                'booking',
                'payment',
                'paymentsuccessful',
                'submerchantregistration',
                'closedbeta',
                'search',
                'user',
                'pickupdeliverycalendar',
                'insurance'
			);

			// if logged in on facebook, login user on the backend and go to required page.
			App.user.getLoginStatus(function(response) {
				// if login was unsuccessful
				if (response.status !== 'connected') {
					loginDeferred.resolve();
				}
				else {
					App.user.loginToBackend(response, function() {
						loginDeferred.resolve();
					});
				}
			});

			$(document).ready(function() {
				documentReadyDeferred.resolve();
			});

			App.gearClassification = new GearClassification.constructor({
				rootURL: Config.API_URL
			});
			App.gearClassification.initialize();

			App.setUserLocation();

			$.when(loginDeferred, documentReadyDeferred).then(function() {
				var route = null,
					hash = '';

				//Load header and footer
				App.loadHeader($headerContainer);

				//Load page based on hash
				hash = window.location.hash;
				if(hash.length > 0) {
					route = hash.substring(1);
				}
				else {
					route = 'home';
				}
				router.navigateTo(route);

				if(getCookie('cookie-consent') != '1') {
					$('.cookie-opt-in').removeClass('hidden');
				}

				$('.cookie-opt-in-button').click(function() {
					document.cookie = 'cookie-consent=1';
					$('.cookie-opt-in').addClass('hidden');
				});

				if(_.isFunction(callback)) {
					callback();
				}
			});
		};

		setUserLocation = function(location, callback) {
			if((!location || location === null) && navigator.geolocation && App.user.data.id !== null) {
				navigator.geolocation.getCurrentPosition(function(position){
                    var lat, lon; 
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    Utilities.getCityFromCoordinates(lat, lon, function (locationCity) {
                        App.user.data.currentCity = locationCity;
                        if(_.isFunction(callback)) {
							callback();
						}
                    });
                });
			}
			else if(!location || location === null) {
				App.user.data.currentCity = null;
			}
			else {
				App.user.data.currentCity = location;
				if(_.isFunction(callback)) {
					callback();
				}
			}
		};

		/**
		 * Loads the header portion of the site. The header contains Sharingear's main navigation and is the same across the app.
		 */
		loadHeader = function($headerContainer, callback) {
			var app = this;
			require(['viewcontrollers/navigation-header', 'text!../templates/navigation-header.html'], function(HeaderController, HeaderTemplate) {
				app.header = new HeaderController.constructor({name: 'header', $element: $headerContainer, labels: {}, template: HeaderTemplate});
				app.header.initialize();
				app.header.render();
				if(_.isFunction(callback)) {
					callback();
				}
			});
		};

		getCookie = function(cname) {
			var name = cname + '=',
				ca = document.cookie.split(';'),
				i, c;
			for(i = 0; i < ca.length; i++) {
				c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) !== -1) {
					return c.substring(name.length, c.length);
				}
			}
			return '';
		};

		App = {
			$headerContainer: $headerContainer,
			$footerContainer: $footerContainer,
			router: Router,
			user: null,
			header: null,
			footer: null,
			gearClassification: null,

			run: run,
			setUserLocation: setUserLocation,
			loadHeader: loadHeader,
			getCookie: getCookie
		};

		App.user = new User.constructor({
			rootURL: Config.API_URL
		});
		App.user.initialize();

		return App;
	}
);
