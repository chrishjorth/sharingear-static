/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['underscore', 'viewcontroller', 'app'],
	function(_, ViewController, App) {

		var didInitialize,
			handleImageUpload,
			didRender,
			handleSave,
			enableSaveButton;

        didInitialize= function() {
            var view = this,
				user = null,
				profileImg = null,
				profileImgLoaded = $.Deferred(),
				renderResolve = $.Deferred(),
                userData;

            if(App.user.data.id === null) {
                this.ready = false;
                App.router.navigateTo('home');
                return;
            }

            this.user = App.user;

            userData = this.user.data;
            this.templateParameters = {
                bio: userData.bio
            };

            this.isSaving = false;

            //Start loading profile image
            this.profileImg = new Image();
            this.profileImg.onload = function() {
                profileImgLoaded.resolve();
            };
            this.profileImg.src = this.user.data.image_url;
        };

        didRender=function() {
            var view = this,
                userData = this.user.data;

            $('#dashboard-profile-form #name', this.$element).val(userData.name);
            $('#dashboard-profile-form #surname', this.$element).val(userData.surname);
            $('#dashboard-profile-form #email', this.$element).val(userData.email);
            $('#dashboard-profile-form #hometown', this.$element).val(userData.city);

            // when page loads, save is disabled
            view.enableSaveButton(false);
            // enable save when something changes in one of the input fields
            $('input, textarea', view.$element).on('input', function() {
                view.enableSaveButton(true);
            });
            //Enable on image change
            $("#prof-pic").on('change',function(){
                view.enableSaveButton(true);
            });

            $.when(this.profileImgLoaded).then(function() {
                var $profilePic = $('#prof-pic-div', view.$element),
                    img = view.profileImg;
                $profilePic.css('background-image', 'url("' + img.src + '")');
                if(img.width < img.height) {
                    $profilePic.css('background-size', '200px auto');
                }
                else{
                    $profilePic.css('background-size', 'auto 200px');
                }
            });

            this.setupEvent('change', '#profile-pic', this, this.handleImageUpload);
            this.setupEvent('submit', '#dashboard-profile-form', this, this.handleSave);
        };

        handleImageUpload = function(event) {
            var view = event.data;
            var $file = $(this);

            $('#profile_image_loading', view.$element).show();
            $('#saveButton', view.$element).hide();

            view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(),App.user.data.id, function (error,url) {

                $('#profile_image_loading', view.$element).hide();
                $('#saveButton', view.$element).show();

                if(error) {
                    alert('Error uploading file.');
                    console.log(error);
                }else{
                    var $profilePic = $('#prof-pic-div', view.$element);
                    $profilePic.css('background-image', 'url("' + url + '")');
                }
            });
        };

        handleSave = function(event) {
            var view = event.data,
                saveData;

            if(view.isSaving === true) {
                return;
            }

            // add spinner to btn
            $('#saveButton', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

            saveData = {
                name: $('#dashboard-profile-form #name', view.$element).val(),
                surname: $('#dashboard-profile-form #surname', view.$element).val(),
                email: $('#dashboard-profile-form #email', view.$element).val(),
                city: $('#dashboard-profile-form #hometown', view.$element).val(),
                bio: $('#dashboard-profile-form #bio', view.$element).val()
            };

            if ($('#dashboard-profile-form #name', view.$element).val()==='') {
                alert("The name field is required.");
                return;
            }

            if ($('#dashboard-profile-form #surname', view.$element).val()==='') {
                alert("The surname field is required.");
                return;
            }

            if ($('#dashboard-profile-form #email', view.$element).val()==='') {
                alert("The email field is required.");
                return;
            }

            view.isSaving = true;

            _.extend(view.user.data, saveData);

            view.user.update(function (error) {
                view.isSaving = false;
                // clear spinner on the button
                $('#saveButton', view.$element).text('Save');

                if(error){
                    console.log(error);
                    return;
                }
                $('#saveSuccessDiv', view.$element).html("Your profile has been updated.");
                view.enableSaveButton(false);
            });
        };

        enableSaveButton = function(active) {
            if (active === false) {
                $('#saveButton', this.$element).attr({disabled: "disabled"});
            }
            else {
                $('#saveButton', this.$element).removeAttr("disabled");
                $('#saveSuccessDiv', this.$element).html("");
            }
        };

		return ViewController.inherit({
			didInitialize: didInitialize,
			handleImageUpload: handleImageUpload,
			didRender: didRender,
			handleSave:handleSave,
			enableSaveButton:enableSaveButton
		});

	}
);