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

    //For landing pages the scheme is 'view_landing-URL'
    this.router.mapRouteToView('copenhagen', 'home_landing-copenhagen');
    this.router.mapRouteToView('copenhagen-instruments-rental', 'home_landing-copenhagen-instruments-rental');
    this.router.mapRouteToView('copenhagen-van-rental', 'home_landing-copenhagen-van-rental');
    this.router.mapRouteToView('copenhagen-technician-hire', 'home_landing-copenhagen-technician-hire');
    this.router.mapRouteToView('copenhagen-backline-rental', 'home_landing-copenhagen-backline-rental');

    this.router.mapRouteToView('london', 'home_landing-london');
    this.router.mapRouteToView('london-instruments-rental', 'home_landing-london-instruments-rental');
    this.router.mapRouteToView('london-van-rental', 'home_landing-london-van-rental');
    this.router.mapRouteToView('london-technician-hire', 'home_landing-london-technician-hire');
    this.router.mapRouteToView('london-backline-rental', 'home_landing-london-backline-rental');

    this.router.mapRouteToView('birmingham', 'home_landing-birmingham');
    this.router.mapRouteToView('birmingham-instruments-rental', 'home_landing-birmingham-instruments-rental');
    this.router.mapRouteToView('birmingham-van-rental', 'home_landing-birmingham-van-rental');
    this.router.mapRouteToView('birmingham-technician-hire', 'home_landing-birmingham-technician-hire');
    this.router.mapRouteToView('birmingham-backline-rental', 'home_landing-birmingham-backline-rental');

    this.router.mapRouteToView('leeds', 'home_landing-leeds');
    this.router.mapRouteToView('leeds-instruments-rental', 'home_landing-leeds-instruments-rental');
    this.router.mapRouteToView('leeds-van-rental', 'home_landing-leeds-van-rental');
    this.router.mapRouteToView('leeds-technician-hire', 'home_landing-leeds-technician-hire');
    this.router.mapRouteToView('leeds-backline-rental', 'home_landing-leeds-backline-rental');

    this.router.mapRouteToView('glasgow', 'home_landing-glasgow');
    this.router.mapRouteToView('glasgow-instruments-rental', 'home_landing-glasgow-instruments-rental');
    this.router.mapRouteToView('glasgow-van-rental', 'home_landing-glasgow-van-rental');
    this.router.mapRouteToView('glasgow-technician-hire', 'home_landing-glasgow-technician-hire');
    this.router.mapRouteToView('glasgow-backline-rental', 'home_landing-glasgow-backline-rental');
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
