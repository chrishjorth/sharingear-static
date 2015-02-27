/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'utilities', 'app', 'viewcontroller'],
	function(_, $, Utilities, App, ViewController) {
		var didInitialize,
			didRender,

			loadSearchBar,
			loadFooter,

			handleTab,
			handleLogin,
			handleScrollDown;

		didInitialize = function() {
			this.hasSubviews = true;
			this.gearSearchFormVC = null;
			this.vanSearchFormVC = null;
		};

		didRender = function() {
			if(App.header) {
                App.header.setTitle();
            }

			this.loadSearchBar();
			this.loadFooter();

			this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
			this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);
        };

        loadSearchBar = function() {
			var view = this;
        	require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
				view.gearSearchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('#home-searchform-gear .searchform-container', view.$element), template: gearSearchVT});
				view.gearSearchFormVC.initialize();
				view.gearSearchFormVC.render();
			});
			require(['viewcontrollers/vansearchform', 'text!../templates/vansearchform.html'], function(vanSearchVC, vanSearchVT) {
				view.vanSearchFormVC = new vanSearchVC.constructor({name: 'vansearchform', $element: $('#home-searchform-vans .searchform-container', view.$element), template: vanSearchVT});
				view.vanSearchFormVC.initialize();
				view.vanSearchFormVC.render();
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

		handleTab = function(event) {
			var $this = $(this),
				view = event.data,
				id;
			id = $this.attr('id');

			//Remove this once technicians are enabled.
			if(id === 'home-tab-technicians') {
				if(App.user.isLoggedIn() === false) {
					view.handleLogin();
				}
				else {
					alert('This feature will be enabled soon, please stay tuned.');
				}
				return;
			}

			$('.sg-tabbar li .sg-btn-square', view.$element).removeClass('selected');
			$this.addClass('selected');

			$('.sg-tab-panel', view.$element).each(function() {
				var $panel = $(this);
				if($panel.hasClass('hidden') === false) {
					$panel.addClass('hidden');
				}
			});
			$('#home-searchform-' + id.substring(9), view.$element).removeClass('hidden'); //9 is the length of 'home-tab-'
		};

		handleLogin = function() {
			App.user.login(function(error) {
				if(!error) {
				    App.router.navigateTo('dashboard');
				    App.header.render();
				    return;
                }
                console.log(error);
			});
		};

		handleScrollDown = function(event) {
			var view = event.data;

			$('html,body').animate({
          		scrollTop: $('#home-whatsay', view.$element).offset().top - 60
        	}, 1000);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			loadSearchBar: loadSearchBar,
			loadFooter: loadFooter,

			handleTab: handleTab,
			handleLogin: handleLogin,
			handleScrollDown: handleScrollDown
		});
	}
);
