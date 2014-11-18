/**
 * Controller for the Sharingear Closed Beta page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var didRender,

			handleContinue;

		didRender = function() {
			var $ctoEmail = $('#closedbeta-ctomail', this.$element);
			$ctoEmail.attr('href', 'mailto:chris' + '@sharin'+ 'gear.com');
			$ctoEmail.html('chris' + '@sharin'+ 'gear.com');

			this.setupEvent('click', '#closedbeta-continue-btn', this, this.handleContinue);
		};

		handleContinue = function() {
			App.router.closeModalView();
		};

		return ViewController.inherit({
			didRender: didRender,
			handleContinue: handleContinue
		});
	}
);