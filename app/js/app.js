/**
 * Initializes the Sharingear app.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('./config.js'),
    Router = require('./router.js'),
    Utilities = require('./utilities.js'),

    User = require('./models/user.js'),
    ContentClassification = require('./models/contentclassification.js'),

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
    var router = this.router,
        loginDeferred = $.Deferred();

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
            loginDeferred.resolve();
        } else {
            console.log('Logging into backend.');
            App.user.loginToBackend(response, function() {
                console.log('User logged in.');
                loginDeferred.resolve();
            });
        }
    });


    App.contentClassification = new ContentClassification.constructor({
        rootURL: Config.API_URL
    });
    App.contentClassification.initialize();

    App.setUserLocation();

    $.when(loginDeferred).then(function() {
        console.log('Sharingear loaded and ready.');

        if (_.isFunction(callback)) {
            callback();
        }
    });
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

module.exports = App;
