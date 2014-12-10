/**
 * Controller for the Sharingear header with navigation view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var Header = ViewController.inherit({
			didRender: didRender,
			setupView: setupView,
			setupEvents: setupEvents,
			handleLogin: handleLogin,
			handleListYourGear: handleListYourGear,
            renderProfilePicture: renderProfilePicture
		});

		return Header;

		function didRender() {
			this.setupView();
			this.setupEvents();
            this.renderProfilePicture();


            $(".dropdownli").click(
                function () {
                    $('ul.file_menu').slideToggle('medium');
                    $('#avatar-arrow-id').toggleClass('fa-rotate-180');
                }
            );
		}

		function setupView() {
			var $buttonsRightContainer = $('#navigationheader-buttonsright', this.$element),
				html = '',
                hovermenu = '';
			if(App.user.data.id === null) {
				html += '<li class="_button-1"><a href="javascript:;" id="navigation-header-signup">SIGN UP</a></li>';
				html += '<li class="_button-2"><a href="javascript:;" id="navigation-header-login">LOG IN</a></li>';
				html += '<li class="active _button-3"><a href="javascript:;" id="navigation-header-listyourgear">LIST YOUR GEAR</a></li>';
				$buttonsRightContainer.html(html);
            }
			else {
                hovermenu = '<ul class="file_menu">';
                hovermenu += '<li><a href="#dashboard/profile"><span class="dropdown-profile-icon dropdown-icon"></span>Profile</a></li>';
                hovermenu += '<li><a href="#dashboard/addgear"><span class="dropdown-addgear-icon dropdown-icon"></span>Add gear</a></li>';
                hovermenu += '<li><a href="#dashboard/yourgear"><span class="dropdown-yourgear-icon dropdown-icon"></span>Your gear</a></li>';
				hovermenu += '<li><a href="#dashboard/yourrentals"><span class="dropdown-rentals-icon dropdown-icon"></span>Your rentals</a></li>';
                hovermenu += '<li><a href="#dashboard/yourreservations"><span class="dropdown-reservation-icon dropdown-icon"></span>Reservations</a></li>';
                    //'<li><a href="#dashboard/calendar"><span class="dropdown-calendar-icon dropdown-icon"></span>Calendar</a></li>' +
                    //'<li><a href="#dashboard/settings"><span class="dropdown-settings-icon dropdown-icon"></span>Settings</a></li></ul>';
                html += '<li class="_button-1 dropdownli list-group-item-selected"><a href="javascript:"><div id="small-profile-pic"></div><span class="avatar-text">'+App.user.data.name+'</span><i id="avatar-arrow-id" class="fa fa-chevron-down avatar-arrow"></i></a>'+hovermenu+'</li>';
                $buttonsRightContainer.html(html);
			}
		}

        function renderProfilePicture() {
            var img, isVertical, backgroundSize;
            if(!App.user.data.image_url) {
                return;
            }
            img = new Image();
            img.onload = function() {
                isVertical = img.width < img.height;
                if(isVertical === true) {
                    backgroundSize = '30px auto';
                }
                else {
                    backgroundSize = 'auto 30px';
                }
                $('#small-profile-pic').css({
                    'background-image': 'url(' + img.src + ')',
                    'background-size': backgroundSize
                });
            };
            img.src = App.user.data.image_url;
        }

		function setupEvents() {
			this.setupEvent('click', '#navigation-header-signup', this, this.handleLogin);
			this.setupEvent('click', '#navigation-header-login', this, this.handleLogin);
			this.setupEvent('click', '#navigation-header-listyourgear', this, this.handleListYourGear);
		}

		function handleLogin(event, callback) {
			var view = event.data,
				user = App.user;

			user.login(function(error) {
				if(!error) {
				    App.router.navigateTo('dashboard');
				    view.setupView();
                }
				
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function handleListYourGear() {
			App.user.login(function(error) {
				if(!error) {
					App.router.navigateTo('dashboard/addgear');
				    view.setupView();
				}
			});
		}
	}
);