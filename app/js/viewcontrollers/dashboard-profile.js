/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app'],
	function(_, ViewController, App) {
		var Profile = ViewController.inherit({
			didInitialize: didInitialize,
            handleImageUpload: handleImageUpload
		}); 
		return Profile;

		function didInitialize() {
			//We need default values so the templating does not fail.
			var user = {
				name: '',
				hometown: '',
				bio: '',
				genres: '',
                image_url:''
			};

			_.extend(user, App.user.data);
			
			this.templateParameters = user;
		}

        function handleImageUpload(event) {
            //TODO finish the handleImageUpload method
            var view = event.data;
            $file = $(this);
            view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(),App.user.data.id, function (error, url) {
                if(error) {
                    alert('Error uploading file.');
                    console.log(error);
                }
            });
        }

	}
);