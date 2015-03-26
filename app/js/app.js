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
    setUserLocation,
    setUserLocation,
    loadHeader,
    getCookie,

    $headerContainer;

/**
 * Initializes the app, that is:
 * - Navigate to correct initial route
 * - Call load header
 * - Call load router
 * @param callback: A function that will be called once the app is initialized.
 */
run = function(callback) {
    var router = this.router;

    GoogleMaps.load();

    router.addRoutes(
        'home',
        'dashboard',
        'dashboard/profile',
        'dashboard/yourgear',
        'dashboard/yourgearrentals',
        'dashboard/yourgearreservations',
        'dashboard/settings',
        'addgear',
        'gearprofile',
        'aboutus',
        'contactus',
        'terms',
        'copyright',
        'privacy',
        'editgear',
        'bookingrequest',
        'gearavailability',
        'booking',
        'payment',
        'paymentsuccessful',
        'submerchantregistration',
        'search',
        'user',
        'pickupdeliverycalendar',
        'insurance',
        'addvan',
        'vanprofile',
        'editvan',
        'dashboard/yourvanrentals',
        'dashboard/yourvanreservations',
        'addtechprofile',
        'techprofile',
        'edittechprofile'
    );

    App.user.getLoginStatus(function(response) {
        // if login was unsuccessful
        if (response.status !== 'connected') {
            console.log('User not logged in.');
            return;
        }
        console.log('Logging into backend.');
        App.user.loginToBackend(response, function() {
            console.log('User logged in.');
            App.rootVC.header.render();
            App.router.currentViewController.render();
        });
    });

    App.contentClassification = new ContentClassification.constructor({
        rootURL: Config.API_URL
    });
    App.contentClassification.initialize();

    App.setUserLocation();

    if (!window.history.pushState) {

        //show message if pushState is not defined
        var messagePopup = new MessagePopup.constructor(),
            message = 'Your browser is outdated and does not support some important features. Please dowload the latest version of your browser of preference.';

        messagePopup.initialize();
        messagePopup.show();
        messagePopup.setMessage(message);

    }

    //$.when(loginDeferred).then(function() {
    //console.log('Sharingear loaded and ready.');

    if (_.isFunction(callback)) {
        callback();
    }
    //});
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
    setUserLocation: setUserLocation,
    loadHeader: loadHeader,
    getCookie: getCookie
};

App.user = new User.constructor({
    rootURL: Config.API_URL
});
App.user.initialize();

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

getCookie = function(cname) {
    var name = cname + '=',
        ca = document.cookie.split(';'),
        i, c;
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) !== -1) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};

App = {
    $headerContainer: $headerContainer,
    router: Router,
    user: null,
    header: null,
    rootVC: null,
    gearClassification: null,

    run: run,
    setUserLocation: setUserLocation,
    loadHeader: loadHeader,
    getCookie: getCookie
};

App.user = new User.constructor({
    rootURL: Config.API_URL
});
App.user.initialize();

module.exports = App;
