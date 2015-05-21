/**
 * Controller for the Sharingear Berlin Vans landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBerlinVans(options) {
	Home.call(this, options);
}

LandingBerlinVans.prototype = new Home();

LandingBerlinVans.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Van, splitter and bus rental, Berlin');
    this.setDescription('Looking to find a van, splitter or bus for your concert or tour in Berlin? Sharingear is your rental marketplace.');
};

LandingBerlinVans.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find band vehicles in Berlin, Germany');
    this.switchToTab('vans');
};

module.exports = LandingBerlinVans;