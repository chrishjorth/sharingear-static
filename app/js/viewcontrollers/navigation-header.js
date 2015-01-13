/**
 * Controller for the Sharingear header with navigation view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'utilities'],
	function($, ViewController, App, Utilities) {
		var defaultTitle,

			didInitialize,
			didRender,
			didResize,
			populateMainMenu,
			renderProfilePicture,
			handleNavbarToggle,
			handleLogin,
			setTitle,
			_updateTitle;

		/* Static variables */
		defaultTitle = '<a href="#home"><img src="images/old_logotop.png" alt="Sharingear logo"></a>';

		didInitialize = function() {
			this.isMobile = false;
		};

		didRender = function() {
			this._updateTitle();
			this.populateMainMenu();
            this.renderProfilePicture();

            this.setupEvent('click', '.sg-navbar-toggle', this, this.handleNavbarToggle);
			this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
		};

		didResize = function(event) {
			var view = event.data;
			if(Utilities.isMobile() !== view.isMobile) {
				view.populateMainMenu();
			}
			view._updateTitle();
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

		/**
		 * @param title: the text to display as title, if null title is set to default
		 */
		setTitle = function(title) {
			if(title === null) {
				title = defaultTitle;
			}
			this.title = title;
			this._updateTitle();
		};

		_updateTitle = function() {
			if(Utilities.isMobile() === true) {
				$('.sg-navbar-brand', this.$element).html(this.title);
			}
			else {
				$('.sg-navbar-brand', this.$element).html(defaultTitle);
			}
		}

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			didResize: didResize,
			populateMainMenu: populateMainMenu,
			renderProfilePicture: renderProfilePicture,
			handleNavbarToggle: handleNavbarToggle,
			handleLogin: handleLogin,
			setTitle: setTitle,
			_updateTitle: _updateTitle
		});
	}
);