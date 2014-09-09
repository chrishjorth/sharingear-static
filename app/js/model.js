/**
 * General model object with support for jQuery ajax.
 * @author: Chris Hjorth
 */
define(
	['underscore', 'jquery'], 
	function(_, $) {
		var defaults = {
			id: null,
			rootURL: '',
			data: null
		};

		function Model(options) {
			_.extend(this, defaults, options);
		}

		_.extend(Model.prototype, {
			get: get,
			post: post,
			put: put,
			del: del
		});

		return Model;

		function get(url, callback) {
			var encodedURL = encodeURI(this.rootURL + url);

			$.ajax({
				dataType: 'json',
				type: 'GET',
				url: encodedURL,
				error: function(jqXHR, textStatus, errorThrown) {
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
						console.log(data.error);
						callback('Error sending resource to server: ' + data.error);
					}
					else {
						callback(null, data);
					}
				}
			});
		}

		function put() {

		}

		function del() {

		}
	}
);