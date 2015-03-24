/**
 * Controller for the Sharingear footer view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Moment = require('moment-timezone'),
	
	ViewController = require('../viewcontroller.js'),

	Localization = require('../models/localization.js'),

	didInitialize;

didInitialize = function() {
    var today = new Moment.tz(Localization.getCurrentTimeZone());

    this.templateParameters = {
        year: today.format('YYYY')
    };
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize
});
