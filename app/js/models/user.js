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
			this.data = {
				id: 0,
				name: 'Chris Hjorth',
				hometown: 'Aalborg',
				bio: 'Blah blah',
				genres: ''
			};

			if(callback && typeof callback === 'function') {
				callback();
			}
		}
	}
);