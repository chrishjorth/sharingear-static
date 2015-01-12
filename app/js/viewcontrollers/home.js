/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'utilities', 'viewcontroller', 'owlcarousel'],
	function(_, $, Utilities, ViewController) { //owlcarousel do not support AMD
		var didInitialize,
			didRender,

			loadSearchBar,
			loadFooter;

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
        };

        loadSearchBar = function() {
			var view = this;
        	require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
				view.searchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('.searchform-container', view.$element), template: gearSearchVT});
				view.searchFormVC.initialize();
				view.searchFormVC.render();
			});
        };

		loadFooter = function($footerContainer) {
			var view = this;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				view.footer = new FooterController.constructor({name: 'footer', $element: $('footer', view.$element), template: FooterTemplate});
				view.footer.initialize();
				view.footer.render();
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			loadSearchBar: loadSearchBar,
			loadFooter: loadFooter
		});
	}
);
