/**
 * Defines a Sharingear user. This can both be a logged in user or the owner of gear.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'model', 'facebook','utilities', 'models/localization'],
	function(_, Model, FB, Utilities, Localization) {
		var didInitialize,
			getLoginStatus,
			login,
			loginToBackend,
			fetch,
			update,
			uploadProfilePicture,
			getPublicInfo,
			isSubMerchant,
			updateBankDetails,
			setSearchInterval,
			getIntervalStart,
			getIntervalEnd,

			isLoggedIn;

		if(FB) {
			FB.init({
				appId: '522375581240221'
			});
		}
		else {
			console.log('Error: Facebook library is not loaded or blocked.');
		}

		didInitialize = function() {
			if(this.data === null) {
				this.data = {
					id: null,
					name: '',
					surname: '',
                	city: '',
                	image_url: '',
                	bio: '',
                	birthdate: null,
                	address: null,
                	postal_code: null,
                	country: null,
                	phone: null,
                	nationality: null,
                	currency: 'EUR',
                	time_zone: 'UTC'
				};
			}
		};

		getLoginStatus = function(callback) {
			var user = this;
			if(!FB) {
				callback({
					status: 'Failed.'
				});
				return;
			}
			FB.getLoginStatus(function(response) {
				//console.log(response);
				user.fbStatus = response.status;
				if(callback && typeof callback === 'function') {
					callback(response);
				}
			}); //Adding the true parameter forces a refresh from the FB servers, but also causes the login popup to be blocked, since it goes async and creates a new execution context
		};

		login = function(callback) {
			var user = this;

			if(!FB) {
				callback('Facebook library is not loaded or blocked.');
				return;
			}

			//We need to make sure Facebook has not changed the status on their side.
			this.getLoginStatus(function(response) {
				if(user.fbStatus !== 'connected') {
					FB.login(function(response) {
						var error;
						//console.log(response);
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

			if(_.isFunction(window.ga) === true) {
				window.ga('send', 'event', 'user action', 'login', 'fb login', 1);
			}

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

				//Enable Google Analytics user tracking
				if(_.isFunction(window.ga) === true) {
					window.ga('set', '&uid', user.data.id); // Set the user ID using signed-in user_id.
				}

				Localization.setCurrentTimeZone(user.data.time_zone);

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
				Localization.setCurrentTimeZone(user.data.time_zone);
				callback(null);
			});
		};

        update = function(callback){
        	var user = this;
            user.put('/users/' + user.data.id, user.data, function (error, data) {
            	if(error) {
            		callback('Error updating user: ' + error);
            		return;
            	}
            	_.extend(user.data, data);
            	Localization.setCurrentTimeZone(user.data.time_zone);
            	callback(null);
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

        setSearchInterval = function(dateRange) {
        	this.data.searchInterval = dateRange;
        };

        getIntervalStart = function() {
        	var date = null;
        	if(this.data.searchInterval) {
        		date = this.data.searchInterval.split('-')[0];
        	}
        	return date;
        };

        getIntervalEnd = function() {
        	var date = null;
        	if(this.data.searchInterval) {
        		date = this.data.searchInterval.split('-')[1];
        	}
        	return date;
        };

        isLoggedIn = function() {
        	return this.data.id !== null;
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
            updateBankDetails: updateBankDetails,
            setSearchInterval: setSearchInterval,
            getIntervalStart: getIntervalStart,
            getIntervalEnd: getIntervalEnd,
            isLoggedIn: isLoggedIn
		});
	}
);