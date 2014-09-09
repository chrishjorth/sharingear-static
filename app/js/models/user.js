/**
 * Defines a Sharingear user.
 * @author: Chris Hjorth
 */
define(
	['utilities', 'model', 'facebook'],
	function(Utilities, Model, FB) {

		var User = Utilities.inherit(Model, {
			fbStatus: '',

			getLoginStatus: getLoginStatus,
			login: login,
			loginToBackend: loginToBackend
		});

		FB.init({
			appId: '522375581240221',
		});

		return User;

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
				console.log('login status response: ');
				console.log(response);
				if(user.fbStatus !== 'connected') {
					console.log('performing FB login');
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
						console.log('login call response: ');
						console.log(response);

						user.fbStatus = response.status;

						if(callback && typeof callback === 'function') {
							callback(error);
						}
					});
				}
				else {
					user.loginToBackend(response, callback);

					/*if(callback && typeof callback === 'function') {
						callback(null);
					}*/
				}
			});
		}

		function loginToBackend(FBResponse, callback) {
			var authData = FBResponse.authResponse,
				postData;

			console.log('FB accessToken: ' + authData.accessToken);
			console.log(authData);

			postData = {
				id: authData.userID,
				accesstoken: authData.accessToken
			};
			this.data = {
				id: authData.userID,
				accessToken: authData.accessToken,
				name: 'Chris Hjorth',
				hometown: 'Aalborg',
				bio: 'Blah blah',
				genres: ''
			};

			this.post('/users/login', postData, function(error, data) {
				if(error) {
					if(callback && typeof callback === 'function') {
						callback('Error logging into backend: ' + error);
					}
					return;
				}
				console.log('successfully logged into backend');
				console.log(data);
				if(callback && typeof callback === 'function') {
					callback(null, data);
				}
				
			});
		}
	}
);