/**
 * Controller for the Sharingear User profile view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'app', 'models/user', 'models/gearlist'],
	function(_, $, Config, ViewController, App, User, GearList) {
		var didInitialize,
			didRender,

			renderProfilePic,
			populateGear,
			renderTabs,

			handleTab;

		didInitialize = function() {
			var view = this,
				pathSections, gearID;

			pathSections = this.subPath.split('/');
			gearID = pathSections[0];
			if(pathSections.length > 1) {
				this.currentTab = pathSections[1];	
			}
			else {
				this.currentTab = 'info';
			}
			this.subPath = ''; //To avoid rendering a subview based on the gear id

			this.user = new User.constructor({
				rootURL: Config.API_URL,
				data: {
					id: gearID
				}
			});
			this.user.initialize();

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
				rootURL: Config.API_URL
			});
			this.userGear.initialize();
			this.userGear.getUserGear(this.user.data.id, function() {
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
				var $this = $(this),
					$listItem;
				$listItem = $this.parent().parent();

				if($this.hasClass(view.currentTab) === true) {
					$this.removeClass('hidden');
					if($listItem.hasClass('active') === false) {
						$listItem.addClass('active');
					}
				}
				else {
					if($this.hasClass('hidden') === false) {
						$this.addClass('hidden');
					}
					$listItem.removeClass('active');
				}
			});
		};

		handleTab = function(event) {
			var view = event.data,
				$button = $(this);

			$('.sg-tabs li', view.$element).removeClass('active');
			$button.parent().addClass('active');

			view.currentTab = $button.data('tab');
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