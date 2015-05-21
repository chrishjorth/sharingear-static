/**
 * Controller for the Sharingear Copenhagen Vans landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingCopenhagenVans(options) {
	Home.call(this, options);
}

LandingCopenhagenVans.prototype = new Home();

LandingCopenhagenVans.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Van, splitter and bus rental, Copenhagen');
    this.setDescription('Looking to find a van, splitter or bus for your concert or tour in Copenhagen? Sharingear is your rental marketplace.');
};

LandingCopenhagenVans.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find band vehicles in Copenhagen, Denmark');
    this.switchToTab('vans');
};

module.exports = LandingCopenhagenVans;