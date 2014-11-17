/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

define(
	['jquery', 'router', 'models/user', 'models/gearclassification', 'models/localization'],
	function($, Router, User, GearClassification, Localization) {
		var App = {
			router: Router,
			header: null,
			footer: null,
			//API_URL: 'http://localhost:1338',
			API_URL: 'https://api.sharingear.com',
			user: null,
			gearClassification: null,
			localization: null,

			run: run,
			loadHeader: loadHeader,
			loadFooter: loadFooter
		};

		App.user = new User.constructor({
			rootURL: App.API_URL
		});

		return App;

		/**
		 * Initializes the app, that is:
		 * - Navigate to correct initial route
		 * - Call load header
		 * - Call load router
		 * @param callback: A function that will be called once the app is initialized.
		 */
		function run(callback) {
			var app = this,
				router = this.router,
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
				'insurance',
				'privacy',
				'editgear',
				'editgearphotos',
				'editgearpricing',
				'gearbooking',
				'gearavailability',
                'booking',
                'payment',
                'paymentsuccessful',
                'submerchantregistration'
			);

			// if logged in on facebook, login user on the backend and go to required page.
			App.user.getLoginStatus(function(response) {
				// if login was unsuccessful
				if (response.status !== "connected") {
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

			App.localization = new Localization.constructor();

			$.when(loginDeferred, documentReadyDeferred).then(function() {
				var route = null,
					hash = '';

				//Load header and footer
				app.loadHeader();

				app.loadFooter();

				//Load page based on hash
				hash = window.location.hash;
				if(hash.length > 0) {
					route = hash.substring(1);
				}
				else {
					route = 'home';
				}
				router.navigateTo(route);

				if(callback && typeof callback == 'function') {
					callback();
				}
			});
		}

		/**
		 * Loads the header portion of the site. The header contains Sharingear's main navigation and is the same across the app.
		 */
		function loadHeader(callback) {
			var header = this.header;
			require(['viewcontrollers/navigation-header', 'text!../templates/navigation-header.html'], function(HeaderController, HeaderTemplate) {
				header = new HeaderController.constructor({name: 'header', $element: $('.navigation-header'), labels: {}, template: HeaderTemplate});
				header.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		/**
		 * Load the footer portion of the site.
		 */
		function loadFooter(callback) {
			var footer = this.footer;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				footer = new FooterController.constructor({name: 'footer', $element: $('.footer'), labels: {}, template: FooterTemplate});
				footer.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);
