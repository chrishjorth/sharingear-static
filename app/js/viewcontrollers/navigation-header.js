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
			_updateTitle,
			changeActiveState;

		/* Static variables */
		defaultTitle = '<a href="#home"><img src="images/logotop@2x.png" alt="Sharingear logo"></a>';

		didInitialize = function() {
			this.isMobile = false;
			this.title = defaultTitle;
		};

		didRender = function() {
			this._updateTitle();
			this.populateMainMenu();
            this.renderProfilePicture();

            this.setupEvent('click', '.sg-navbar-toggle', this, this.handleNavbarToggle);
			this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
			this.setupEvent('click', '.sg-navbar-slidemenu .list-group-item', this, this.handleNavbarToggle);
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
				$menuList = $('.list-group', $slideMenu);
				html += '<a href="#home" class="list-group-item"><img src="images/logotop@2x.png" alt="Sharingear logo"></a>';
			}
			else {
				this.isMobile = false;
				$dropdownMenu.removeClass('hidden');
				if($slideMenu.hasClass('hidden') === false) {
					$slideMenu.addClass('hidden');
				}
				$menuList = $('.list-group', $dropdownMenu);
			}

			html += '<a href="#search" class="list-group-item"><div class="sg-icon icon-dashboard-profile"></div><div class="list-group-item-text">Search</div></a>';

			if(App.user.data.id === null) {
				html += '<a href="javascript:;" class="list-group-item" id="navigation-header-login"><div class="sg-icon icon-dashboard-profile"></div><div class="list-group-item-text">Login</div></a>';
            }
			else {
                html += '<a href="#dashboard/profile" class="list-group-item"><div class="sg-icon icon-dashboard-profile"></div><div class="list-group-item-text">Your profile</div></a>';
                html += '<a href="#dashboard/yourgear" class="list-group-item"><div class="sg-icon icon-dashboard-yourgear"></div><div class="list-group-item-text">Your gear</div></a>';
                html += '<a href="#dashboard/yourtechprofiles" class="list-group-item"><div class="sg-icon icon-dashboard-yourtechprofile"></div><div class="list-group-item-text">Your tech profiles</div></a>';
                html += '<a href="#dashboard/yourvans" class="list-group-item"><div class="sg-icon icon-dashboard-yourvans"></div><div class="list-group-item-text">Your vans</div></a>';
                html += '<a href="#dashboard/yourgearrentals" class="list-group-item"><div class="sg-icon icon-dashboard-gearrentals"></div><div class="list-group-item-text">Gear rentals</div></a>';
                html += '<a href="#dashboard/yourtechprofilerentals" class="list-group-item"><div class="sg-icon icon-dashboard-techhires"></div><div class="list-group-item-text">Tech hires</div></a>';
                html += '<a href="#dashboard/yourvanrentals" class="list-group-item"><div class="sg-icon icon-dashboard-vanrentals"></div><div class="list-group-item-text">Van rentals</div></a>';
                html += '<a href="#dashboard/yourgearreservations" class="list-group-item"><div class="sg-icon icon-dashboard-reservations"></div><div class="list-group-item-text">Gear reservations</div></a>';
                html += '<a href="#dashboard/yourtechprofilereservations" class="list-group-item"><div class="sg-icon icon-dashboard-reservations"></div><div class="list-group-item-text">Tech reservations</div></a>';
                html += '<a href="#dashboard/yourvanreservations" class="list-group-item"><div class="sg-icon icon-dashboard-reservations"></div><div class="list-group-item-text">Van reservations</div></a>';
                html += '<a href="#dashboard/settings" class="list-group-item"><div class="sg-icon icon-dashboard-settings"></div><div class="list-group-item-text">Settings</div></a>';
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
            img.src = App.user.data.image_url;
        };

		handleNavbarToggle = function(event) {
			var view = event.data,
				$this = $(this),
				$viewContainer = $('.view-container'),
				$navbar, $tabbar, handleTransition;

			handleTransition = function() {
				$this.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
				$this.removeClass('sliding-right');
			};

			$navbar = $('.sg-navbar', view.$element);
			$tabbar = $('.sg-tabbar-container', $viewContainer);
			if($tabbar.css('position') !== 'fixed') {
				//We are not in a mobile situation
				$tabbar = $('');
			}

			$navbar.addClass('sliding-right');
			$navbar.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', handleTransition);
			$viewContainer.addClass('sliding-right');
			$viewContainer.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', handleTransition);
			$tabbar.addClass('sliding-right');
			$tabbar.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', handleTransition);
			
			if($navbar.hasClass('slide-right') === true) {
				$navbar.removeClass('slide-right');
				$viewContainer.removeClass('slide-right');
				$tabbar.removeClass('slide-right');
			}
			else {
				$navbar.addClass('slide-right');
				$viewContainer.addClass('slide-right');
				$tabbar.addClass('slide-right');
			}

			//Handle selection display
			if($this.hasClass('list-group-item') === true) {
				view.changeActiveState($this);
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
                else {
                	alert('Could not connect to Facebook.');
                	console.log(error);
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
			if(!title || title === null) {
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
		};

		changeActiveState = function($menuItem){
        	$('.list-group-item', this.$element).removeClass('list-group-item-selected');
			$menuItem.addClass('list-group-item-selected');
        };

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			didResize: didResize,
			populateMainMenu: populateMainMenu,
			renderProfilePicture: renderProfilePicture,
			handleNavbarToggle: handleNavbarToggle,
			handleLogin: handleLogin,
			setTitle: setTitle,
			_updateTitle: _updateTitle,
			changeActiveState: changeActiveState
		});
	}
);