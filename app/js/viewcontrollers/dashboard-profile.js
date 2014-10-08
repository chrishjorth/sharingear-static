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
            handleSave:handleSave,

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

            //Image handling
            var isVertical;
            var img = new Image();
            img.src = this.user.data.image_url;
            var imgWidth = img.width;
            var imgHeight = img.height;
            isVertical = imgWidth < imgHeight;

            //TODO background-image is not loaded
            var picture_url = 'url("'+this.user.data.image_url+'")';
            console.log(picture_url);
            $('#prof-pic-div').css("background-image",picture_url);
            if (isVertical) {
                $('#prof-pic-div').css("background-size","auto "+imgWidth);
            }else{
                $('#prof-pic-div').css("background-size",imgHeight+ "auto");
            }

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

        function handleSave(saveData,callback){
            this.user.updateUser(App.user.data.user_id,saveData, function (error, data) {
                if(error){
                    if(callback && typeof callback === 'function') {
                        callback('Error updating user: ' + error);
                    }
                }
            });
        }

	}
);