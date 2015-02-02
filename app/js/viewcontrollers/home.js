/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'utilities', 'app', 'viewcontroller', 'owlcarousel'],
	function(_, $, Utilities, App, ViewController) { //owlcarousel do not support AMD
		var didInitialize,
			didRender,

			loadSearchBar,
			loadFooter,

			handleTechniciansTab,
			handleVansTab,
			handleLogin;

		didInitialize = function() {
			this.searchFormVC = null;
		};

		didRender = function() {
			if(App.header) {
                App.header.setTitle();
            }

			this.loadSearchBar();
			this.loadFooter();

			this.setupEvent('click', '#home-tab-technicians', this, this.handleTechniciansTab);
			this.setupEvent('click', '#home-tab-vans', this, this.handleVansTab);
        };

        loadSearchBar = function() {
			var view = this;
        	require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
				view.searchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('.searchform-container', view.$element), template: gearSearchVT});
				view.searchFormVC.initialize();
				view.searchFormVC.render();
			});
        };

		loadFooter = function() {
			var view = this;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				view.footer = new FooterController.constructor({name: 'footer', $element: $('footer', view.$element), template: FooterTemplate});
				view.footer.initialize();
				view.footer.render();
			});
		};

		handleTechniciansTab = function(event) {
			var view = event.data;
			if(App.user.isLoggedIn() === false) {
				view.handleLogin();
			}
			else {
				alert('This feature will be enabled soon, please stay tuned.');
			}
		};

		handleVansTab = function(event) {
			var view = event.data;
			if(App.user.isLoggedIn() === false) {
				view.handleLogin();
			}
			else {
				alert('This feature will be enabled soon, please stay tuned.');
			}
		};

		handleLogin = function() {
			App.user.login(function(error) {
				if(!error) {
				    App.router.navigateTo('dashboard');
				    App.header.render();
                }
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			loadSearchBar: loadSearchBar,
			loadFooter: loadFooter,

			handleTechniciansTab: handleTechniciansTab,
			handleVansTab: handleVansTab,
			handleLogin: handleLogin
		});
	}
);
