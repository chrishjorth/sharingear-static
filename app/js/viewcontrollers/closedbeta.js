/**
 * Controller for the Sharingear Closed Beta page view.
 * Users log in with their Facebook account, then we check their fb id or email against our list of allowed users.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app'],
	function($, ViewController, App) {
		var didInitialize,
			didRender,

			handleLoginToBeta;

		didInitialize = function() {
			
		};

		didRender = function() {
			var $ctoEmail = $('.ctomail', this.$element);
			$ctoEmail.attr('href', 'mailto:chris' + '@sharin'+ 'gear.com');
			$ctoEmail.html('chris' + '@sharin'+ 'gear.com');

			this.setupEvent('click', '#closedbeta-login-btn', this, this.handleLoginToBeta);
		};

		handleLoginToBeta = function(event) {
			var view = event.data;
			App.user.login(function(error) {
				if(error) {
					console.log(error);
					alert('Error loggin in.');
					return;
				}
				if(App.user.data.id === null) {
					$('#closedbeta-intro', view.$element).addClass('hidden');
					$('#closedbeta-noaccess', view.$element).removeClass('hidden');
				}
				else {
					App.router.closeModalView();
				}
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			handleLoginToBeta: handleLoginToBeta
		});
	}
);
