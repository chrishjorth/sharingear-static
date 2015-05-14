/**
 * Initializes the view hierarchy.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    App = require('./app.js'),

    HeaderController = require('./viewcontrollers/navigation-header.js'),
    HeaderTemplate = require('../templates/navigation-header.html'),

    initialize,
    refresh,

    loadHeader,
    getCookie;

require('bootstrap');
require('./libraries/owl-carousel/owl.carousel.min.js');

initialize = function(callback) {
    var hash, route;

    this.loadHeader($('.navigation-header'));

    App.rootVC = this;

    //Load page based on hash
    hash = window.location.hash;
    if (hash.length > 0) {
        route = hash.substring(2); //2 because we use hashbangs #!
    } else {
        route = 'home';
    }
    App.router.navigateTo(route);

    if (this.getCookie('cookie-consent') !== '1') {
        $('.cookie-opt-in').removeClass('hidden');
    }

    $('.cookie-opt-in-button').click(function() {
        document.cookie = 'cookie-consent=1';
        $('.cookie-opt-in').addClass('hidden');
    });

    callback();
};

refresh = function() {
    this.header.initialize();
    this.header.render();
    App.router.currentViewController.initialize();
    App.router.currentViewController.render();
};

/**
 * Loads the header portion of the site. The header contains Sharingear's main navigation and is the same across the app.
 */
loadHeader = function($headerContainer, callback) {
    this.header = new HeaderController({
        name: 'header',
        $element: $headerContainer,
        labels: {},
        template: HeaderTemplate
    });
    this.header.initialize();
    this.header.render();
    if (_.isFunction(callback)) {
        callback();
    }
};

//TODO: Move this to utilities
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

module.exports = {
    header: null,

    initialize: initialize,
    refresh: refresh,
    loadHeader: loadHeader,
    getCookie: getCookie
};
