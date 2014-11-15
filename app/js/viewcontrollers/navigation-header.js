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

            $(".hoverli").hover(
                function () {
                    $('ul.file_menu').slideDown('medium');
                },
                function () {
                    $('ul.file_menu').slideUp('medium');
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
//                hovermenu = '<ul class="file_menu"><li><a href="#file">File</a></li><li><a href="#edit">Edit</a></li><li><a href="#view">View</a></li></ul>';
                html += '<li class="_button-1 hoverli"><a href="#dashboard"><div id="small-profile-pic"></div><span class="avatar-text">'+App.user.data.name+'</span><i class="fa fa-chevron-down avatar-arrow"></i></a>'+hovermenu+'</li>';
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