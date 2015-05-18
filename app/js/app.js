/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    GoogleMaps = require('./libraries/mscl-googlemaps.js'),
    Facebook = require('./libraries/mscl-facebook.js'),

    Config = require('./config.js'),
    Router = require('./router.js'),
    Utilities = require('./utilities.js'),

    Localization = require('./models/localization.js'),
    User = require('./models/user.js'),
    ContentClassification = require('./models/contentclassification.js'),
    MessagePopup = require('./popups/messagepopup.js'),

    App,

    run,
    setUserLocation,
    setupRouteMappings;

run = function(callback) {
    var app = this,
        messagePopup = new MessagePopup(),
        message = 'Your browser is outdated and does not support some important features. Please dowload the latest version of your browser of preference.';

    //Load libraries that require external data
    Localization.fetch();
    GoogleMaps.load();
    Facebook.load();

    window.mixpanel.track('App loaded');

    this.user = new User({
        rootURL: Config.API_URL
    });
    this.user.initialize();

    this.user.restoreLogin(function(error) {
        if (!error) {
            if (app.rootVC && app.rootVC !== null) {
                app.rootVC.refresh();
            }
        }
    });

    ContentClassification.getClassification();

    this.setUserLocation();

    this.setupRouteMappings();

    if (!window.history.pushState) {
        //The browser is not supported. pushState is a feature available only in moderne (ie9+) browsers
        messagePopup.initialize();
        messagePopup.show();
        messagePopup.setMessage(message);
    }

    callback();
};

setUserLocation = function(location, callback) {
    if ((!location || location === null) && navigator.geolocation && App.user.data.id !== null) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat, lon;
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            Utilities.getCityFromCoordinates(lat, lon, function(locationCity) {
                App.user.data.currentCity = locationCity;
                if (_.isFunction(callback)) {
                    callback();
                }
            });
        });
    } else if (!location || location === null) {
        App.user.data.currentCity = null;
    } else {
        App.user.data.currentCity = location;
        if (_.isFunction(callback)) {
            callback();
        }
    }
};

setupRouteMappings = function() {
    this.router.mapRouteToView('search-gear', 'search');
    this.router.mapRouteToView('search-vans', 'search');
    this.router.mapRouteToView('search-technicians', 'search');
};

App = {
    router: Router,
    user: null,
    rootVC: null,

    run: run,
    setUserLocation: setUserLocation,
    setupRouteMappings: setupRouteMappings
};

module.exports = App;
