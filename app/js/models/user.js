/**
 * Defines a Sharingear user. This can both be a logged in user or the owner of gear.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'model', 'facebook','utilities'],
	function(_, Model, FB, Utilities) {
		var didInitialize,
			getLoginStatus,
			login,
			loginToBackend,
			fetch,
			update,
			uploadProfilePicture,
			getPublicInfo,
			isSubMerchant,
			updateBankDetails;

		FB.init({
			appId: '522375581240221'
		});

		didInitialize = function() {
			if(this.data === null) {
				this.data = {
					id: null,
					name: '',
					surname: '',
                	city: '',
                	image_url: '',
                	bio: '',
                	submerchant: false
				};
			}
		};

		getLoginStatus = function(callback) {
			var user = this;
			FB.getLoginStatus(function(response) {
				user.fbStatus = response.status;
				if(callback && typeof callback === 'function') {
					callback(response);
				}
			});
		};

		login = function(callback) {
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
		};

		loginToBackend = function(FBResponse, callback) {
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
		};

		fetch = function(callback) {
			var user = this;
			user.get('/users/' + user.data.id, function(error, data) {
				if(error) {
					callback(error);
					return;
				}
				_.extend(user.data, data);
				callback(null);
			});
		};

        update = function(callback){
        	var user = this;
            user.put('/users/' + user.data.id, user.data, function (error, data) {
                if(!error){
                	_.extend(user.data, data);
                }
                else {
                	error = 'Error updating user: ' + error;
                }
                callback(error);
            });
        };

        uploadProfilePicture = function(file, filename, userID, callback){
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
        };

        getPublicInfo = function(callback) {
        	var model = this;

        	this.get('/users/' + this.data.id, function(error, user) {
        		if(error) {
        			callback(error);
        			return;
        		}
        		_.extend(model.data, user);
        		callback(null);
        	});
        };

        isSubMerchant = function() {
        	return this.data.hasBank;
        };

        updateBankDetails = function(callback) {
        	var user = this;
            user.put('/users/' + user.data.id + '/bankdetails', user.data, function (error) {
                if(error){
                	callback('Error updating bank details: ' + error);
                }
                callback(null);
            });
        };

        return Model.inherit({
			fbStatus: '',

			didInitialize: didInitialize,
			getLoginStatus: getLoginStatus,
			login: login,
			loginToBackend: loginToBackend,
            uploadProfilePicture: uploadProfilePicture,
            fetch: fetch,
            update:update,
            getPublicInfo: getPublicInfo,
            isSubMerchant: isSubMerchant,
            updateBankDetails: updateBankDetails
		});
	}
);