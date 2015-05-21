/**
 * Controller for the Sharingear Leeds Instruments landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingLeedsInstruments(options) {
	Home.call(this, options);
}

LandingLeedsInstruments.prototype = new Home();

LandingLeedsInstruments.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Musical instruments rental, Leeds');
    this.setDescription('Looking to find instruments for your concert or tour in Leeds? Sharingear is your rental marketplace.');
};

LandingLeedsInstruments.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find instruments in Leeds, UK');
};

module.exports = LandingLeedsInstruments;