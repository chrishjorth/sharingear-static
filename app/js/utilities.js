/**
 * JavaScript utilities.
 * @author: Chris Hjorth
 */
define(
    ['googlemaps'],
    function(GoogleMaps) {
    var Util ={
        geocoder: new GoogleMaps.Geocoder(),

        inherit: inherit,
        getBaseURL: getBaseURL,
        ajajFileUpload: ajajFileUpload,
        geoLocationGetCity: geoLocationGetCity,
        getCityFromCoordinates: getCityFromCoordinates
//        getUserInfo: getUserInfo
    };

	return Util;

	/**
	 * @return A new object that has the same properties as object but with the added properties inheritOptions
	 */
	function inherit(object, inheritOptions) {
		var Inherited;

		if(typeof inheritOptions !== 'object') {
			inheritOptions = {};
		}

		Inherited = function(options) {
			if(typeof options !== 'object') {
				options = {};
			}

			_.extend(inheritOptions, options);
			
			object.call(this, inheritOptions);
		};
		
		//Inherited.prototype = new object();
		Inherited.prototype.constructor = Inherited;
		return Inherited;
	}

	function getBaseURL() {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol+"//"+window.location.host;
		}
		return window.location.origin;
	}

	/**
	 * @param file: $('#upload-form input[type="file"]').get(0).files[0];
	 * @param inputName: The name for the file expected on the backend
	 */
	function ajajFileUpload(url, secretProof, fileName, file, callback) {
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
			success: function(data, textStatus, jqXHR) {
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
	}

    //Get city name based on latitude and longitude
    function geoLocationGetCity(lat, lon, callback) {
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
    }

        function getCityFromCoordinates(lat, lon, callback) {
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
        }

});