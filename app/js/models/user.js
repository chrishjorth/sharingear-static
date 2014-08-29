/**
 * Defines a Sharingear user.
 * @author: Chris Hjorth
 */
define(
	['utilities', 'model'],
	function(Utilities, Model) {
		var User = Utilities.inherit(Model, {
			login: login
		});

		return User;

		function login(callback) {
			if(callback && typeof callback === 'function') {
				callback();
			}
		}
	}
);