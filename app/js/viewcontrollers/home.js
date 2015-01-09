/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'utilities', 'viewcontroller', 'owlcarousel'],
	function(_, $, Utilities, ViewController) { //owlcarousel do not support AMD
		var didInitialize,
			didRender;

		didInitialize = function() {
			this.searchFormVC = null;
		};

		didRender = function() {
			var view = this,
				$searchformContainer = $('.searchform-container', this.$element);

			if(this.searchFormVC === null) {
				require(['viewcontrollers/gearsearchform', 'text!../templates/gearsearchform.html'], function(gearSearchVC, gearSearchVT) {
					view.searchFormVC = new gearSearchVC.constructor({name: 'gearsearchform', $element: $('.searchform-container', view.$element), template: gearSearchVT});
					view.searchFormVC.initialize();
					view.searchFormVC.render();
				});
			}
			else {
				view.searchFormVC.render();
			}

            $('#feedbacks', this.$element).owlCarousel({
                navigation: false,
                slideSpeed: 800,
                paginationSpeed: 400,
                autoPlay: 7000,
                singleItem: true
            });
        };

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender
		});
	}
);
