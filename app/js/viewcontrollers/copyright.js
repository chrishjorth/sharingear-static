/**
 * Controller for the Sharingear Copyright view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller'],
	function($, ViewController) {
		var didRender,
			loadFooter;

		didRender = function() {
			this.loadFooter();
		};

		loadFooter = function() {
			var view = this;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				view.footer = new FooterController.constructor({name: 'footer', $element: $('footer', view.$element), template: FooterTemplate});
				view.footer.initialize();
				view.footer.render();
			});
		};

		return ViewController.inherit({
			didRender: didRender,
			loadFooter: loadFooter
		});
	}
);