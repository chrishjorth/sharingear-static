/**
 * Controller for the Sharingear footer view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Moment = require('moment-timezone'),
	
	ViewController = require('../viewcontroller.js'),

	Localization = require('../models/localization.js');

function Footer(options) {
	ViewController.call(this, options);
}

Footer.prototype = new ViewController();

Footer.prototype.didInitialize = function() {
    var today = new Moment.tz(Localization.getCurrentTimeZone());

    this.templateParameters = {
        year: today.format('YYYY')
    };
};

module.exports = Footer;
