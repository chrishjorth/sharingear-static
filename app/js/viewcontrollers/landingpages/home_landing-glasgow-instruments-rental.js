/**
 * Controller for the Sharingear Glasgow Instruments landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingGlasgowInstruments(options) {
	Home.call(this, options);
}

LandingGlasgowInstruments.prototype = new Home();

LandingGlasgowInstruments.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Musical instruments rental, Glasgow');
    this.setDescription('Looking to find instruments for your concert or tour in Glasgow? Sharingear is your rental marketplace.');
};

LandingGlasgowInstruments.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find instruments in Glasgow, UK');
};

module.exports = LandingGlasgowInstruments;