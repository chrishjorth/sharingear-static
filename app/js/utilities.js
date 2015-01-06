/**
 * JavaScript utilities.
 * @author: Chris Hjorth
 */

'use strict';

define(
    ['underscore', 'jquery', 'googlemaps'],
    function(_, $, GoogleMaps) {
    	var geocoder,
    		inherit,
    		getBaseURL,
    		ajajFileUpload,
    		getCityFromCoordinates,
    		getQueryStringParameterValue,
    		capitalizeString,
    		isMomentBetween,
    		isMobile;

    	geocoder = new GoogleMaps.Geocoder();

		/**
	 	 * @return A new object that has the same properties as object but with the added properties inheritOptions
	 	 */
		inherit = function(object, defaultOptions) {
			var Inherited;

			if(typeof defaultOptions !== 'object') {
				defaultOptions = {};
			}

			//This becomes the actual contstructor
			Inherited = function(options) {
				if(typeof options !== 'object') {
					options = {};
				}
				_.extend(options, defaultOptions); //Fill in missing defaults
				object.call(this, options);
			};
		
			//Inherited.prototype = new object();
			Inherited.prototype.constructor = Inherited;
			return Inherited;
		};

		getBaseURL = function() {
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + '//' + window.location.host;
			}
			return window.location.origin;
		};

		/**
		 * @param file: $('#upload-form input[type="file"]').get(0).files[0];
		 * @param inputName: The name for the file expected on the backend
		 */
		ajajFileUpload = function(url, secretProof, fileName, file, callback) {
			var formData = new FormData();
			formData.append('uploadedfile', file);
			formData.append('fileName', fileName);
			formData.append('secretProof', secretProof);
		
			$.ajax({
				url: url,
				type: 'POST',
				data: formData,
				dataType: 'json',
				//Options to tell jQuery not to process data or worry about content-type.
				cache: false,
				contentType: false,
				processData: false,
				success: function(data) {
					if(data.error) {
						callback(data.error);
						return;
					}
					if(data.code && data.code === '401') {
						callback(data.message);
						return;
					}
					callback(null, data);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					var error = 'Error uploading file with AJAX POST: ' + textStatus + '. ' + errorThrown;
					callback(error);
				}
			});
		};

		getCityFromCoordinates = function(latitude, longitude, callback) {
			var geocoder = new GoogleMaps.Geocoder(),
				latLng = new GoogleMaps.LatLng(latitude,longitude);
        	//Use Google Geocoder to translate the coordinates to city name
        	geocoder.geocode({'latLng': latLng}, function (results, status) {
        		var locationCity = null;
        		if(status === GoogleMaps.GeocoderStatus.OK) {
        			locationCity = results[0].address_components[2].long_name;
        		}
        		callback(locationCity);
        	});
    	};

    	/**
		 * Receives a query string and returns the value for the specified key.
		 * Inspired by http://stackoverflow.com/a/1099670
		 */
		getQueryStringParameterValue = function(queryString, key) {
			var regEx = /[?&]?([^=]+)=([^&]*)/g,
				parameters = {},
				tokens;
			queryString = queryString.split('+').join(' ');
        	while( (tokens = regEx.exec(queryString)) !== null ) {
				parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        	}
        	return parameters[key];
		};

		capitalizeString = function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		};

		/**
		 * This function considers days as smallest time unit.
		 * This function is inclusive.
		 */
		//TODO: rename to isDayMomentBetween
		isMomentBetween = function(moment, intervalStart, intervalEnd) {
			return ((moment.isAfter(intervalStart, 'day') === true || moment.isSame(intervalStart, 'day') === true) && (moment.isBefore(intervalEnd, 'day') === true || moment.isSame(intervalEnd, 'day') === true));
		};

		/**
		 * Breakpoints are Bootstrap compatible.
		 */
		isMobile = function() {
			var breakpoints = [768, 992, 1200],
				viewWidth = $(document).width();
			return (viewWidth < breakpoints[0]);
		};

		return {
        	inherit: inherit,
        	getBaseURL: getBaseURL,
        	ajajFileUpload: ajajFileUpload,
        	getCityFromCoordinates: getCityFromCoordinates,
        	getQueryStringParameterValue: getQueryStringParameterValue,
        	capitalizeString: capitalizeString,
        	isMomentBetween: isMomentBetween,
        	isMobile: isMobile
    	};
	}
);
