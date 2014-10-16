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
            enableSaveButton:enableSaveButton,
		}); 
		return Profile;

        function didInitialize() {
            if(App.user.data.id === null) {
                this.ready = false;
                App.router.navigateTo('home');
                return;
            }
            //We need default values so the templating does not fail.
            var view = this,
                user;

            user = {
                name: '',
                hometown: '',
                bio: '',
                genres: '',
                image_url:''
            };
            this.user = App.user;
            _.extend(user, App.user.data);
            this.templateParameters = user;


            //Start loading profile image
            this.profileImg = new Image();
            this.profileImg.onload = function() {
                view.profileImgLoaded.resolve();
            };
            this.profileImg.src = this.user.data.image_url;
        }

        function didRender() {
            var view = this;

            var userData = this.user.data;
            $('#dashboard-profile-form #name',this.$element).val(userData.name);
            $('#dashboard-profile-form #surname',this.$element).val(userData.surname);
            $('#dashboard-profile-form #city',this.$element).val(userData.city);

            // when page loads, save is disabled
            view.enableSaveButton(false);
            // enable save when something changes in one of the input fields
            $('input, textarea').on('input', function() {
                view.enableSaveButton(true);
            });

            $.when(this.profileImgLoaded).then(function() {
                var $profilePic = $('#prof-pic-div', view.$element),
                    img = view.profileImg;
                $profilePic.css('background-image', 'url("' + img.src + '")');
                if(img.width < img.height) {
                    $profilePic.css('background-size', 'auto ' + img.width);
                }
                else{
                    $profilePic.css('background-size', img.height + ' auto');
                }
            });

            this.setupEvent('change', '#profile-pic', this, this.handleImageUpload);
            this.setupEvent('submit', '#dashboard-profile-form', this, this.handleSave);
        }

        function handleImageUpload(event) {
            //TODO finish the handleImageUpload method
            var view = event.data;
            $file = $(this);
            console.log($file);
            console.log(App.user.data.id);
            console.log(App.user.data.image_url);

            view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(),App.user.data.id, function (error) {
                console.log('Callback works!');
                if(error) {
                    alert('Error uploading file.');
                    console.log(error);
                }
            });
        }

        function handleSave(event) {
            var view = event.data,
                saveData,
            saveData = {
                name: $('#dashboard-profile-form #name').val(),
                surname: $('#dashboard-profile-form #surname').val(),
                city: $('#dashboard-profile-form #hometown').val(),
                bio: $('#dashboard-profile-form #bio').val()
            }
            console.log('Saved. User id: ' + App.user.data.id);
            // if no error, show message to user, next to save button
            $('#saveSuccessDiv').html("Your profile has been updated");
            view.enableSaveButton(false);

            view.user.updateUser(App.user.data.id, saveData, function (error, data) {
                if(error){
                    console.log(error);
                }
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