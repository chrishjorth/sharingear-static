/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'router', 'utilities', 'models/user', 'models/gearclassification', 'models/localization'],
	function($, Router, Utilities, User, GearClassification, Localization) {
		var IS_PRODUCTION = true, //This variable should be set and saved according to the git branch: true for master and false for develop
			API_URL,
			App,

			isProduction,
			run,
			loadHeader,
			loadFooter;

		if(IS_PRODUCTION === true) {
			API_URL = 'https://prod-api.sharingear.com';
		}
		else {
			API_URL = 'https://api.sharingear.com';
		}

		//API_URL = 'http://localhost:1338'; //Uncomment for testing local API

		isProduction = function() {
			return (IS_PRODUCTION === true);
		};

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
				'listyourgear',
				'dashboard',
				'dashboard/profile',
				'dashboard/yourgear',
				'dashboard/yourreservations',
				'dashboard/calendar',
				'dashboard/settings',
				'gearprofile',
				'aboutus',
				'contactus',
				'terms',
				'copyright',
				'privacy',
				'editgear',
				'editgearphotos',
				'editgearpricing',
				'gearbooking',
				'gearavailability',
                'booking',
                'payment',
                'paymentsuccessful',
                'submerchantregistration',
                'closedbeta'
			);

			App.user = new User.constructor({
				rootURL: API_URL
			});

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
				rootURL: App.API_URL
			});

			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position){
                    var lat, lon; 
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    Utilities.getCityFromCoordinates(lat, lon, function (locationCity) {
                        App.user.data.currentCity = locationCity;
                    });
                });
			}

			App.localization = new Localization.constructor();

			$.when(loginDeferred, documentReadyDeferred).then(function() {
				var route = null,
					hash = '';

				//Load header and footer
				App.loadHeader();

				App.loadFooter();

				//Load page based on hash
				hash = window.location.hash;
				if(hash.length > 0) {
					route = hash.substring(1);
				}
				else {
					route = 'home';
				}
				router.navigateTo(route, null, function() {
					router.openModalView('closedbeta');
				});

				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		/**
		 * Loads the header portion of the site. The header contains Sharingear's main navigation and is the same across the app.
		 */
		loadHeader = function(callback) {
			var header = this.header;
			require(['viewcontrollers/navigation-header', 'text!../templates/navigation-header.html'], function(HeaderController, HeaderTemplate) {
				header = new HeaderController.constructor({name: 'header', $element: $('.navigation-header'), labels: {}, template: HeaderTemplate});
				header.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		/**
		 * Load the footer portion of the site.
		 */
		loadFooter = function(callback) {
			var footer = this.footer;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				footer = new FooterController.constructor({name: 'footer', $element: $('.footer'), labels: {}, template: FooterTemplate});
				footer.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		App = {
			isProduction: isProduction,
			router: Router,
			header: null,
			footer: null,
			API_URL: API_URL,
			user: null,
			gearClassification: null,
			localization: null,

			run: run,
			loadHeader: loadHeader,
			loadFooter: loadFooter
		};
		return App;
	}
);
