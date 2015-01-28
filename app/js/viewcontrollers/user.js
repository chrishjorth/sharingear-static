/**
 * Controller for the Sharingear User profile view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/user'],
	function(_, $, ViewController, App, User) {
		var didInitialize,
			didRender,

			renderProfilePic,

			handleTab;

		didInitialize = function() {
			var view = this;

			this.user = new User.constructor({
				rootURL: App.API_URL,
				data: {
					id: this.subPath
				}
			});
			
			this.subPath = ''; //To avoid rendering a subview based on the gear id

			this.templateParameters = {
				name: '',
				bio: ''
			};
			
			this.user.fetch(function(error) {
				if(error) {
					console.log('Error fetching user: ' + error);
					return;
				}
				view.templateParameters = {
					name: view.user.data.name + ' ' + view.user.data.surname.substring(0, 1) + '.',
					bio: view.user.data.bio
				};
				view.render();
			});
		};

		didRender = function() {
			this.renderProfilePic();

			this.setupEvent('click', '.sg-tabs button', this, this.handleTab);
		};

		renderProfilePic = function() {
			var view = this,
				img;

			if(!this.user.data.image_url) {
        		return;
        	}

        	img = new Image();
        	img.onload = function() {
        		var backgroundSize;
        		if(img.width < img.height) {
        			backgroundSize = '100% auto';
        		} else {
        			backgroundSize = 'auto 100%';
        		}
        		$('.profile-pic', view.$element).css({
        			'background-image': 'url(' + img.src + ')',
        			'background-size': backgroundSize
        		});
        	};
        	img.src = this.user.data.image_url;
		};

		handleTab = function(event) {
			var view = event.data,
				tab = $(this).data('tab');

			$('.sg-tab-panel', view.$element).each(function() {
				var $this = $(this);
				if($this.hasClass(tab) === true) {
					$this.removeClass('hidden');
				}
				else {
					if($this.hasClass('hidden') === false) {
						$this.addClass('hidden');
					}
				}
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderProfilePic: renderProfilePic,

			handleTab: handleTab
		});
	}
);