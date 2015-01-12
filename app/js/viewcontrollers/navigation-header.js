/**
 * Controller for the Sharingear header with navigation view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'utilities'],
	function($, ViewController, App, Utilities) {
		var didInitialize,
			didRender,
			didResize,
			populateMainMenu,
			handleNavbarToggle,
			handleLogin,
			//handleListYourGear,
			renderProfilePicture;


		didInitialize = function() {
			this.isMobile = false;
		};

		didRender = function() {
			this.populateMainMenu();
			
            this.renderProfilePicture();

            this.setupEvent('click', '.sg-navbar-toggle', this, this.handleNavbarToggle);
            //this.setupEvent('click', '#navigation-header-signup', this, this.handleLogin);
			this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
			//this.setupEvent('click', '#navigation-header-listyourgear', this, this.handleListYourGear);
		};

		didResize = function(event) {
			var view = event.data;
			if(Utilities.isMobile() !== view.isMobile) {
				view.populateMainMenu();
			}
		};

		populateMainMenu = function() {
			var html = '',
				$slideMenu, $dropdownMenu, $menuList;

			$slideMenu = $('#navigation-header-slidemenu-left', this.$element);
			$dropdownMenu = $('#navigation-header-dropdownmenu-left', this.$element);

			if(Utilities.isMobile() === true) {
				this.isMobile = true;
				$slideMenu.removeClass('hidden');
				if($dropdownMenu.hasClass('hidden') === false) {
					$dropdownMenu.addClass('hidden');
				}
				$menuList = $('ul', $slideMenu);
				html += '<li><a href="#home">Sharingear</a></li>';
			}
			else {
				this.isMobile = false;
				$dropdownMenu.removeClass('hidden');
				if($slideMenu.hasClass('hidden') === false) {
					$slideMenu.addClass('hidden');
				}
				$menuList = $('ul', $dropdownMenu);
			}

			html += '<li><a href="#search">Search</a></li>';

			if(App.user.data.id === null) {
				html += '<li><a href="javascript:;" id="navigation-header-login">Login</a></li>';
            }
			else {
                html += '<li><a href="#dashboard/profile">Your profile</a></li>';
                html += '<li><a href="#dashboard/yourgear">Your gear</a></li>';
                html += '<li>Your tech profile</a></li>';
                html += '<li>Your vans</li>';
                html += '<li><a href="#dashboard/yourrentals">Gear rentals</a></li>';
                html += '<li>Tech hires</li>';
                html += '<li>Van rentals</li>';
                html += '<li><a href="#dashboard/yourrentals">Gear reservations</a></li>';
                html += '<li>Tech reservations</li>';
                html += '<li>Van reservations</li>';
                html += '<li>Settings</li>';
			}

			$menuList.html(html);
		};

		handleNavbarToggle = function(event) {
			var view = event.data,
				$viewContainer = $('.view-container'),
				handleTransition;

			handleTransition = function() {
				var $this = $(this);
				$this.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
				$this.removeClass('sliding-right');
			};
			view.$element.addClass('sliding-right');
			view.$element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', handleTransition);
			$viewContainer.addClass('sliding-right');
			$viewContainer.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', handleTransition);

			if(view.$element.hasClass('slide-right') === true) {
				view.$element.removeClass('slide-right');
				$viewContainer.removeClass('slide-right');
			}
			else {
				view.$element.addClass('slide-right');
				$viewContainer.addClass('slide-right');
			}
		};

		handleLogin = function(event, callback) {
			var view = event.data,
				user = App.user;

			user.login(function(error) {
				if(!error) {
				    App.router.navigateTo('dashboard');
				    view.render();
                }
				
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		/*handleListYourGear = function(event) {
			var view = event.data;
			App.user.login(function(error) {
				if(!error) {
					App.router.navigateTo('dashboard/addgear');
				    view.setupView();
				}
			});
		};*/

		renderProfilePicture = function() {
            var view = this,
            	img;
            if(!App.user.data.image_url) {
                return;
            }
            img = new Image();
            img.onload = function() {
            	var isVertical, backgroundSize;
                isVertical = img.width < img.height;
                if(isVertical === true) {
                    backgroundSize = '30px auto';
                }
                else {
                    backgroundSize = 'auto 30px';
                }
                $('.profile-pic', view.$element).css({
                    'background-image': 'url(' + img.src + ')',
                    'background-size': backgroundSize
                });
            };
            console.log(App.user.data.image_url);
            img.src = App.user.data.image_url;
        };

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			didResize: didResize,
			populateMainMenu: populateMainMenu,
			handleNavbarToggle: handleNavbarToggle,
			handleLogin: handleLogin,
			//handleListYourGear: handleListYourGear,
            renderProfilePicture: renderProfilePicture
		});
	}
);