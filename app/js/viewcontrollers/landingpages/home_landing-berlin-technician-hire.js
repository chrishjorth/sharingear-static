/**
 * Controller for the Sharingear Berlin Technicians landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBerlinTechnicians(options) {
	Home.call(this, options);
}

LandingBerlinTechnicians.prototype = new Home();

LandingBerlinTechnicians.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Technician hire, Berlin');
    this.setDescription('Looking to find technicians for your concert or tour in Berlin? Sharingear is your rental marketplace.');
};

LandingBerlinTechnicians.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find technicians in Berlin, Germany');
    this.switchToTab('techprofiles');
};

module.exports = LandingBerlinTechnicians;