/**
 * Controller for the Sharingear London Instruments landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingLondonInstruments(options) {
	Home.call(this, options);
}

LandingLondonInstruments.prototype = new Home();

LandingLondonInstruments.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Musical instruments rental, London');
    this.setDescription('Looking to find instruments for your concert or tour in London? Sharingear is your rental marketplace.');
};

LandingLondonInstruments.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find instruments in London, UK');
};

module.exports = LandingLondonInstruments;