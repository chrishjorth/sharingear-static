/**
 * Controller for the Sharingear Birmingham Technicians landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBirminghamTechnicians(options) {
	Home.call(this, options);
}

LandingBirminghamTechnicians.prototype = new Home();

LandingBirminghamTechnicians.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Technician hire, Birmingham');
    this.setDescription('Looking to find technicians for your concert or tour in Birmingham? Sharingear is your rental marketplace.');
};

LandingBirminghamTechnicians.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find technicians in Birmingham, UK');
    this.switchToTab('techprofiles');
};

module.exports = LandingBirminghamTechnicians;