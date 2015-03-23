/**
 * Entry point for the Sharingear app and environment configuration.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

//ie9 console.log fix
if (!window.console) {
    window.console = {
        log: function() {}
    };
}

var _ = require('underscore'),
    $ = require('jquery'),

    app = require('./app.js'),
    rootVC = require('./rootviewcontroller.js');


_.templateSettings = {
    evaluate: /\{\{=(.+?)\}\}/g,
    interpolate: /\{\{(.+?)\}\}/g,
    escape: /\{\{-(.+?)\}\}/g
};

window.jQuery = $;

$(document).ready(function() {
    console.log('DOM ready.');

    app.run(function() {
        rootVC.initialize();
    });
});
