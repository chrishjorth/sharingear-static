/**
 * Defines a Sharingear user. This can both be a logged in user or the owner of gear.
 * @author: Chris Hjorth
 */
define(
	['model', 'facebook','utilities'],
	function(Model, FB, Utilities) {

		var User = Model.inherit({
			fbStatus: '',
			data: null,

			didInitialize: didInitialize,
			getLoginStatus: getLoginStatus,
			login: login,
			loginToBackend: loginToBackend,
            uploadProfilePicture: uploadProfilePicture,
            updateUser:updateUser,
            getPublicInfo: getPublicInfo
		});

		FB.init({
			appId: '522375581240221'
		});

		return User;

		function didInitialize() {
			this.data = {
				id: null,
				name: '',
				surname: '',
                city: '',
                image_url: '',
                bio: ''
			};
		}

		function getLoginStatus(callback) {
			var user = this;
			FB.getLoginStatus(function(response) {
				user.fbStatus = response.status;
				if(callback && typeof callback === 'function') {
					callback(response);
				}
			});
		}

		function login(callback) {
			var user = this;

			//We need to make sure Facebook has not changed the status on their side.
			this.getLoginStatus(function(response) {
				if(user.fbStatus !== 'connected') {
					FB.login(function(response) {
						var error;
						if(response.status === 'connected') {
							error = null;
							user.loginToBackend(response, callback);
                            return;
						}
						else if(response.status === 'not_authorized') {
							error = {error: 'FB App not authorized'};
						}
						else {
							error = {error: 'FB login failed'};
						}

						user.fbStatus = response.status;

						if(callback && typeof callback === 'function') {
							callback(error);
						}
					}, {scope: 'email'});
				}
				else {
					user.loginToBackend(response, callback);
				}
			});
		}

		function loginToBackend(FBResponse, callback) {
			var user = this,
				authData = FBResponse.authResponse,
				postData;

			postData = {
				fbid: authData.userID,
				accesstoken: authData.accessToken
			};
			this.post('/users/login', postData, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback('Error logging into backend: ' + error);
					}
					return;
				}
				if(user.data === null) {
					user.data = {};
				}
				_.extend(user.data, data);
				if(callback && typeof callback === 'function') {
					callback(null, data);
				}
			});
		}

        function updateUser(userID, saveData, callback){
        	var user = this;
            this.put('/users/' + userID, saveData, function (error, data) {
                if(error){
                    if(callback && typeof callback === 'function') {
                        callback('Error getting filename: ' + error);
                    }
                    return;
                }
                _.extend(user.data, data);
            });
        }

        function uploadProfilePicture(file, filename, userID, callback){
            var model = this;
            this.get('/users/' + userID + '/newfilename/' + filename, function (error, data) {
                if(error){
                    if(callback && typeof callback === 'function') {
                        callback('Error getting filename: ' + error);
                    }
                	return;
                }
                Utilities.ajajFileUpload('fileupload.php', data.secretProof, data.fileName, file, function(error, data) {
                    var postData;
                    if(error) {
                        if(callback && typeof callback === 'function') {
                            callback('Error uploading file: ' + error);
                        }
                        return;
                    }

                    //Add image url to backend
                    postData = {
                        image_url: data.url
                    };

                    model.put('/users/' + userID, postData, function (error, images) {
                        if(error){
                            if(callback && typeof callback === 'function') {
                                callback('Error uploading file: ' + error);
                            }
                            return;
                        }
                        model.data.images = images.images;
                        callback(null, data.url);
                    });

                });
            });
        }

        function getPublicInfo(callback) {
        	var model = this;

        	this.get('/users/' + this.data.id, function(error, user) {
        		if(error) {
        			callback(error);
        			return;
        		}
        		_.extend(model.data, user);
        		callback(null);
        	});
        }
	}
);