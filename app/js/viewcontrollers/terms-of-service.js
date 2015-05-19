/**
 * Controller for the Sharingear Insurance page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var ViewController = require('../viewcontroller.js');

function Terms(options) {
	ViewController.call(this, options);
}

Terms.prototype = new ViewController();

Terms.prototype.didInitialize = function() {
	this.setTitle('Sharingear - Terms of service');
};

module.exports = Terms;
