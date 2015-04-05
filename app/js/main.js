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

console.log('Scripts loaded...');

$(document).ready(function() {
    rootVC.initialize(function(){
        console.log('Root viewcontroller initialized.');
    });

    app.run(function() {
        console.log('App initialized.');
    });
});
