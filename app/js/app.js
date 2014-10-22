/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

define(
	['jquery', 'router', 'models/user', 'models/gearclassification'],
	function($, Router, User, GearClassification) {
		var App = {
			router: Router,
			header: null,
			footer: null,
			//API_URL: 'http://0.0.0.0:1338',
			API_URL: 'http://api.sharingear.com',
			user: null,
			gearClassification: null,
			
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
				hash = '';

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
                'gearpendingconfirm'
			);

			$(document).ready(function() {
				var route = null;

				//Load header and footer
				app.loadHeader();

				app.loadFooter();

				var loadInitialPage = function() {
					//Load page based on hash
					hash = window.location.hash;
					if(hash.length > 0) {
						route = hash.substring(1);
					}
					else {
						route = 'home';
					}
					router.navigateTo(route);
					if(callback && typeof callback === 'function') {
						callback();
					}
				};

				// if logged in on facebook, login user on the backend and go to required page.
				App.user.getLoginStatus(function(response) {
					// if login was unsuccessful
					if (response.status !== "connected") {
						loadInitialPage();
					} else {
						App.user.loginToBackend(response, function() {
							loadInitialPage();
						});
					}
				});

				App.gearClassification = new GearClassification.constructor({
					rootURL: App.API_URL
				});

			});

			console.log('Sharingear initialized.');
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