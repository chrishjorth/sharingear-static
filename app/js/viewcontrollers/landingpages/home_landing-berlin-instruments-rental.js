/**
 * Controller for the Sharingear Berlin Instruments landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBerlinInstruments(options) {
	Home.call(this, options);
}

LandingBerlinInstruments.prototype = new Home();

LandingBerlinInstruments.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Musical instruments rental, Berlin');
    this.setDescription('Looking to find instruments for your concert or tour in Berlin? Sharingear is your rental marketplace.');
};

LandingBerlinInstruments.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find instruments in Berlin, Germany');
};

module.exports = LandingBerlinInstruments;