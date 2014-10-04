/**
 * Defines a Sharingear user.
 * @author: Chris Hjorth
 */
define(
	['model', 'facebook'],
	function(Model, FB) {

		var User = Model.inherit({
			fbStatus: '',
			data: {
				id: null,
				name: '',
				surname: '',
                city: ''
			},

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
			console.log('Get login status');
			FB.getLoginStatus(function(response) {
				console.log(response);
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
				console.log('GOT STATUS');
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
	}
);