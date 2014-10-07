/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app'],
	function(_, ViewController, App) {
		var Profile = ViewController.inherit({
			didInitialize: didInitialize,
            handleImageUpload: handleImageUpload,
            didRender: didRender,

            user: null
		}); 
		return Profile;

        function didRender() {
            this.setupEvent('change','#profile-pic',this,this.handleImageUpload);
        }
		function didInitialize() {
			//We need default values so the templating does not fail.
			var user = {
				name: '',
				hometown: '',
				bio: '',
				genres: '',
                image_url:''
			};
            this.user = App.user;

			_.extend(user, App.user.data);
			
			this.templateParameters = user;
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

	}
);