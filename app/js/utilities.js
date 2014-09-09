/**
 * JavaScript utilities.
 * @author: Chris Hjorth
 */
define([
], function() {
	return {
		inherit: inherit,
		getBaseURL: getBaseURL
	};

	/**
	 * @return A new object that has the same properties as object but with the added properties inheritOptions
	 */
	function inherit(object, inheritOptions) {
		if(typeof inheritOptions !== 'object') {
			inheritOptions = {};
		}

		var Inherited = function(options) {
			if(typeof options !== 'object') {
				options = {};
			}

			_.extend(inheritOptions, options);
			
			object.call(this, inheritOptions);
		};

		Inherited.prototype = new object();
		Inherited.prototype.constructor = Inherited;
		return Inherited;
	}

	function getBaseURL() {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol+"//"+window.location.host;
		}
		return window.location.origin;
	}
});