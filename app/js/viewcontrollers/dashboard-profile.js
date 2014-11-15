/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

define(
	['underscore', 'viewcontroller', 'app'],
	function(_, ViewController, App) {
		var Profile = ViewController.inherit({
            user: null,
            profileImg: null,
            profileImgLoaded: $.Deferred(),
            renderResolve: $.Deferred(),

			didInitialize: didInitialize,
            handleImageUpload: handleImageUpload,
            didRender: didRender,
            handleSave:handleSave,
            enableSaveButton:enableSaveButton
		}); 
		return Profile;

        function didInitialize() {
            var view = this,
                userData;

            if(App.user.data.id === null) {
                this.ready = false;
                App.router.navigateTo('home');
                return;
            }

            this.user = App.user;

            userData = this.user.data;
            this.templateParameters = {
                bio: userData.bio,
            };

            //Start loading profile image
            this.profileImg = new Image();
            this.profileImg.onload = function() {
                view.profileImgLoaded.resolve();
            };
            this.profileImg.src = this.user.data.image_url;
        }

        function didRender() {
            var view = this,
                userData = this.user.data;
            
            $('#dashboard-profile-form #name', this.$element).val(userData.name);
            $('#dashboard-profile-form #surname', this.$element).val(userData.surname);
            $('#dashboard-profile-form #email', this.$element).val(userData.email);
            $('#dashboard-profile-form #hometown', this.$element).val(userData.city);

            // when page loads, save is disabled
            view.enableSaveButton(false);
            // enable save when something changes in one of the input fields
            $('input, textarea').on('input', function() {
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
        }

        function handleImageUpload(event) {
            var view = event.data;
            $file = $(this);

            $('#profile_image_loading').show();
            $('#saveButton').hide();

            view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(),App.user.data.id, function (error,url) {

                $('#profile_image_loading').hide();
                $('#saveButton').show();

                if(error) {
                    alert('Error uploading file.');
                    console.log(error);
                }else{
                    var $profilePic = $('#prof-pic-div', view.$element);
                    $profilePic.css('background-image', 'url("' + url + '")');
                }
            });
        }

        function handleSave(event) {

            var view = event.data,
                saveData;

            // add spinner to btn
            $('#saveButton').html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

            saveData = {
                name: $('#dashboard-profile-form #name').val(),
                surname: $('#dashboard-profile-form #surname').val(),
                email: $('#dashboard-profile-form #email').val(),
                city: $('#dashboard-profile-form #hometown').val(),
                bio: $('#dashboard-profile-form #bio').val()
            };

            if ($('#dashboard-profile-form #name').val()==='') {
                alert("The name field is required.");
                return;
            }

            if ($('#dashboard-profile-form #surname').val()==='') {
                alert("The surname field is required.");
                return;
            }

            if ($('#dashboard-profile-form #email').val()==='') {
                alert("The email field is required.");
                return;
            }

            _.extend(view.user.data, saveData);

            view.user.update(function (error) {
                // clear spinner on the button
                $('#saveButton').text('Save');

                if(error){
                    console.log(error);
                    return;
                }
                $('#saveSuccessDiv').html("Your profile has been updated.");
                view.enableSaveButton(false);
            });
        }

        // if active==true, enables save button, else disables
        function enableSaveButton(active) {

            if (!active) {
                // disable button
                $('#saveButton').attr({disabled: "disabled"});
            } else {
                // enable button
                $('#saveButton').removeAttr("disabled");
                // clear success message
                $('#saveSuccessDiv').html("");
            }
        }
	}
);