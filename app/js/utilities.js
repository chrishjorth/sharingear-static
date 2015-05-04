/**
 * JavaScript utilities.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
    GoogleMaps = require('./libraries/mscl-googlemaps.js'),

    getBaseURL,
    ajajFileUpload,
    getCityFromCoordinates,
    getQueryString,
    getQueryStringParameterValue,
    capitalizeString,
    isMomentBetween,
    isMobile;

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
            if (data.error) {
                callback(data.error);
                return;
            }
            if (data.code && data.code === '401') {
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
    var utilities = this,
        geocoder, latLng;

    if (GoogleMaps.isLoaded() === false) {
        setTimeout(function() {
            utilities.getCityFromCoordinates(latitude, longitude, callback);
        }, 10);
        return;
    }

    geocoder = new GoogleMaps.Geocoder();
    latLng = new GoogleMaps.LatLng(latitude, longitude);

    //Use Google Geocoder to translate the coordinates to city name
    geocoder.geocode({
        'latLng': latLng
    }, function(results, status) {
        var locationCity = null;
        if (status === GoogleMaps.GeocoderStatus.OK) {
            locationCity = results[0].address_components[2].long_name;
        }
        callback(locationCity);
    });
};

getQueryString = function() {
    var queryString = window.location.href.split('?')[1];
    if (queryString) {
        queryString = queryString.split('#')[0];
    }
    return queryString;
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
    while ((tokens = regEx.exec(queryString)) !== null) {
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

module.exports = {
    getBaseURL: getBaseURL,
    ajajFileUpload: ajajFileUpload,
    getCityFromCoordinates: getCityFromCoordinates,
    getQueryString: getQueryString,
    getQueryStringParameterValue: getQueryStringParameterValue,
    capitalizeString: capitalizeString,
    isMomentBetween: isMomentBetween,
    isMobile: isMobile
};
