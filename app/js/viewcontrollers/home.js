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
			handVansTab,
			handleLogin;

		didInitialize = function() {
			this.searchFormVC = null;
		};

		didRender = function() {
			this.loadSearchBar();
			this.loadFooter();

            /*$('#feedbacks', this.$element).owlCarousel({
                navigation: false,
                slideSpeed: 800,
                paginationSpeed: 400,
                autoPlay: 7000,
                singleItem: true
            });*/
			this.setupEvent('click', '#home-tab-technicians', this, this.handleTechniciansTab);
			this.setupEvent('click', '#home-tab-vans', this, this.handVansTab);
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
			view.handleLogin();
		};

		handVansTab = function() {
			var view = event.data;
			view.handleLogin();
		};

		handleLogin = function() {
			App.user.login(function(error) {
				if(!error) {
				    App.router.navigateTo('dashboard');
                }
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			loadSearchBar: loadSearchBar,
			loadFooter: loadFooter,

			handleTechniciansTab: handleTechniciansTab,
			handVansTab: handVansTab,
			handleLogin: handleLogin
		});
	}
);
