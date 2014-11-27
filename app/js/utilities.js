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
    		geoLocationGetCity,
    		getCityFromCoordinates,
    		getQueryStringParameterValue,
    		capitalizeString,
    		isMomentBetween;

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

    	//Get city name based on latitude and longitude
    	geoLocationGetCity = function(lat, lon, callback) {
        	var latitude = lat;
        	var longitude = lon;
        	var geocoder = new GoogleMaps.Geocoder();
        	var locationCity = '';

        	//Use Google Geocoder to translate the coordinates to city name
        	var latLng = new GoogleMaps.LatLng(latitude,longitude);
        	geocoder.geocode({'latLng':latLng}, function (results, status) {

            	if(status === GoogleMaps.GeocoderStatus.OK) {
                	locationCity = results[0].address_components[2].long_name;

                	$('#search-location').val(locationCity);
                	$('#listyourgear-location').val(locationCity);
                	callback(locationCity);
            	}
        	});
    	};

		getCityFromCoordinates = function(lat, lon, callback) {
			var latitude = lat;
			var longitude = lon;
			var geocoder = new GoogleMaps.Geocoder();
			var locationCity = '';
	
			//Use Google Geocoder to translate the coordinates to city name
        	var latLng = new GoogleMaps.LatLng(latitude,longitude);
        	geocoder.geocode({'latLng':latLng}, function (results, status) {
        		if(status === GoogleMaps.GeocoderStatus.OK) {
        			locationCity = results[0].address_components[2].long_name;
        			callback(locationCity);
        		}
        	});
    	};

    	/**
		 * Receives a query string and returns the value for the specified parameter.
		 * Inspired by http://stackoverflow.com/a/1099670
		 */
		getQueryStringParameterValue = function(queryString, parameter) {
			var regEx = /[?&]?([^=]+)=([^&]*)/g,
				parameters = {},
				tokens;
			queryString = queryString.split('+').join(' ');
        	while( (tokens = regEx.exec(queryString)) !== null ) {
				parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        	}
        	return parameters[parameter];
		};

		capitalizeString = function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		};

		isMomentBetween = function(moment, intervalStart, intervalEnd) {
			return ((moment.isAfter(intervalStart, 'day') === true || moment.isSame(intervalStart, 'day') === true) && (moment.isBefore(intervalEnd, 'day') === true || moment.isSame(intervalEnd, 'day') === true));
		};

		return {
        	inherit: inherit,
        	getBaseURL: getBaseURL,
        	ajajFileUpload: ajajFileUpload,
        	geoLocationGetCity: geoLocationGetCity,
        	getCityFromCoordinates: getCityFromCoordinates,
        	getQueryStringParameterValue: getQueryStringParameterValue,
        	capitalizeString: capitalizeString,
        	isMomentBetween: isMomentBetween
    	};
	}
);
