/*jslint node: true */
'use strict';

var load,
    isLoaded,
    getGeocoder,
    getGeocoderStatus,
    getAutocomplete,
    getMap,
    getMarker,
    getLatLng,

    googlemaps = null;

window.mscl_googlemaps_initialize = function() {
    googlemaps = window.google.maps;
};

load = function() {
    var script;
    if(googlemaps !== null) {
        return;
    }
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' + '&signed_in=true&libraries=places&callback=mscl_googlemaps_initialize';
    document.body.appendChild(script);
};

isLoaded = function() {
    return googlemaps !== null;
};

getGeocoder = function() {
    if (!(this instanceof getGeocoder)) {
        console.error('mscl-googlemaps error: getGeocoder must be called with new.');
        return null;
    }

    if (googlemaps === null) {
        console.error('mscl-googlemaps getGeocoder error: Google Maps not loaded.');
        return null;
    }

    return new googlemaps.Geocoder();
};

getGeocoderStatus = function() {
    if (googlemaps === null) {
        console.error('mscl-googlemaps getGeocoder error: Google Maps not loaded.');
        return null;
    }

    return googlemaps.GeocoderStatus;
};

getAutocomplete = function(inputElement, options) {
    if (!(this instanceof getAutocomplete)) {
        console.error('mscl-googlemaps error: getAutocomplete must be called with new.');
        return null;
    }

    if (googlemaps === null) {
        console.error('mscl-googlemaps getPlaces error: Google Maps not loaded.');
        return null;
    }

    return new googlemaps.places.Autocomplete(inputElement, options);
};

getMap = function(element, options) {
    if (!(this instanceof getMap)) {
        console.error('mscl-googlemaps error: getMap must be called with new.');
        return null;
    }

    if (googlemaps === null) {
        console.error('mscl-googlemaps getMap error: Google Maps not loaded.');
        return null;
    }

    return new googlemaps.Map(element, options);
};

getMarker = function(options) {
    if (!(this instanceof getMarker)) {
        console.error('mscl-googlemaps error: getMarker must be called with new.');
        return null;
    }

    if (googlemaps === null) {
        console.error('mscl-googlemaps getMarker error: Google Maps not loaded.');
        return null;
    }

    return new googlemaps.Marker(options);
};

getLatLng = function(latitude, longitude) {
    if (!(this instanceof getLatLng)) {
        console.error('mscl-googlemaps error: getLatLng must be called with new.');
        return null;
    }

    if (googlemaps === null) {
        console.error('mscl-googlemaps getLatLng error: Google Maps not loaded.');
        return null;
    }

    return new googlemaps.LatLng(latitude, longitude);
};

module.exports = {
    load: load,
    isLoaded: isLoaded,
    Geocoder: getGeocoder,
    GeocoderStatus: getGeocoderStatus,
    places: {
        Autocomplete: getAutocomplete
    },
    Map: getMap,
    Marker: getMarker,
    LatLng: getLatLng
};
