/**
 * Controller for the Sharingear User profile view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/user', 'models/gearlist'],
	function(_, $, ViewController, App, User, GearList) {
		var didInitialize,
			didRender,

			renderProfilePic,
			populateGear,
			renderTabs,

			handleTab;

		didInitialize = function() {
			var view = this;

			this.currentTab = 'info';

			this.user = new User.constructor({
				rootURL: App.API_URL,
				data: {
					id: this.subPath
				}
			});
			this.user.initialize();
			
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

			this.userGear = new GearList.constructor({
				rootURL: App.API_URL
			});
			this.userGear.initialize();
			console.log(this.userGear.data);
			this.userGear.getUserGear(this.user.data.id, function(gear) {
				view.render();
			});
		};

		didRender = function() {
			this.renderProfilePic();
			this.renderTabs();
			this.populateGear();

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

		populateGear = function() {
			var view = this;
			require(['text!../templates/user-gear-item.html'], function(GearItemTemplate) {
				var gearItemTemplate = _.template(GearItemTemplate),
					gearList = view.userGear.data,
					$gearBlock, defaultGear, gear, i, $gearItem;

				$gearBlock = $('#user-gear-container', view.$element);

				for(i = 0; i < gearList.length; i++) {
					defaultGear = {
						id: null,
						gear_type: '',
						subtype: '',
						brand: '',
						model: '',
						img_url: 'images/placeholder_grey.png'
					};

					gear = gearList[i];
					_.extend(defaultGear, gear.data);
					if(defaultGear.images.length > 0) {
						defaultGear.img_url = defaultGear.images.split(',')[0];
					}
					$gearItem = $(gearItemTemplate(defaultGear));
					$('.sg-bg-image' ,$gearItem).css({
						'background-image': 'url("' + defaultGear.img_url + '")'
					});
					$gearBlock.append($gearItem);
				}
			});
		};

		renderTabs = function() {
			var view = this;
			$('.sg-tab-panel', view.$element).each(function() {
				var $this = $(this);
				if($this.hasClass(view.currentTab) === true) {
					$this.removeClass('hidden');
				}
				else {
					if($this.hasClass('hidden') === false) {
						$this.addClass('hidden');
					}
				}
			});
		};

		handleTab = function(event) {
			var view = event.data;
			view.currentTab = $(this).data('tab');
			view.renderTabs();
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderProfilePic: renderProfilePic,
			populateGear: populateGear,
			renderTabs: renderTabs,

			handleTab: handleTab
		});
	}
);