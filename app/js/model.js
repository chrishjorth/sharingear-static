/**
 * General model object with support for jQuery ajax.
 * @author: Chris Hjorth
 */
define(
	['underscore', 'jquery', 'utilities'], 
	function(_, $, Utilities) {
		var defaults, methods, constructor, inherit;

		defaults = {
			id: null,
			rootURL: '',
			data: null
		};

		methods = {
			get: get,
			post: post,
			put: put,
			del: del
		};

		constructor = function(options) {
			_.extend(this, defaults, methods, options);
			
			if(this.didInitialize && typeof this.didInitialize == 'function') {
				this.didInitialize();
			}
		};

		inherit = function(inheritOptions) {
			var inherited = {
				constructor: Utilities.inherit(this.constructor, inheritOptions)
			};
			return inherited;
		}

		return {
			constructor: constructor,
			inherit: inherit
		};

		function get(url, callback) {
			var encodedURL = encodeURI(this.rootURL + url);

			$.ajax({
				dataType: 'json',
				type: 'GET',
				url: encodedURL,
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					callback('Error executing GET request: ' + errorThrown);
				},
				success: function(data, textStatus, jqXHR) {
					if(data.error) {
						callback('Error retrieving resource from server: ' + data.error);
					}
					else {
						callback(null, data);
					}
				}
			});
		}

		function post(url, data, callback) {
			var encodedURL = encodeURI(this.rootURL + url);

			$.ajax({
				dataType: 'json',
				type: 'POST',
				data: data,
				url: encodedURL,
				error: function(jqXHR, textStatus, errorThrown) {
					callback('Error executing POST request: ' + errorThrown);

				},
				success: function(data, textStatus, jqXHR) {

					if(data.error) {
						callback('Error sending resource to server: ' + data.error);
					}
					else {
						callback(null, data);
					}
				}
			});
		}

		function put(url, data, callback) {
			var encodedURL = encodeURI(this.rootURL + url);

			$.ajax({
				dataType: 'json',
				type: 'PUT',
				data: data,
				url: encodedURL,
				error: function(jqXHR, textStatus, errorThrown) {
					callback('Error executing PUT request: ' + errorThrown);
				},
				success: function(data, textStatus, jqXHR) {
					if(data.error) {
						console.log(data.error);
						callback('Error putting resource to server: ' + data.error);
					}
					else {
						callback(null, data);
					}
				}
			});
		}

		function del() {

		}
	}
);