/**
 * Mock of the Facebook SDK.
 * @author: Chris Hjorth
 */
define(
	[],
	function() {
		return {
			init: init,
			getLoginStatus: getLoginStatus
		};

		function init(appID) {

		}

		function getLoginStatus(callback) {
			callback({
				status: 'connected',
				authResponse: {
					userID: '10152481416874843',
					accessToken: ''
				}
			});
		}
	}
);