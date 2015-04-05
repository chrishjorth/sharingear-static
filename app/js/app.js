/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    GoogleMaps = require('./libraries/mscl-googlemaps.js'),

    Config = require('./config.js'),
    Router = require('./router.js'),
    Utilities = require('./utilities.js'),

    User = require('./models/user.js'),
    ContentClassification = require('./models/contentclassification.js'),
    MessagePopup = require('./popups/messagepopup.js'),

    App,

    run,
    setUserLocation;

run = function(callback) {
    var messagePopup = new MessagePopup.constructor(),
        message = 'Your browser is outdated and does not support some important features. Please dowload the latest version of your browser of preference.';

    GoogleMaps.load();

    App.user.login(function() {
        if(App.rootVC && App.rootVC !== null) {
            App.rootVC.refresh();
        }
    });

    App.contentClassification.initialize();

    App.setUserLocation();

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

App = {
    router: Router,
    user: null,
    rootVC: null,
    gearClassification: null,

    run: run,
    setUserLocation: setUserLocation
};

App.user = new User.constructor({
    rootURL: Config.API_URL
});
App.user.initialize();

App.contentClassification = new ContentClassification.constructor({
    rootURL: Config.API_URL
});

module.exports = App;
