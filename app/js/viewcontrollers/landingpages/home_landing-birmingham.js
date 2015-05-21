/**
 * Controller for the Sharingear Birmingham landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBirmingham(options) {
	Home.call(this, options);
}

LandingBirmingham.prototype = new Home();

LandingBirmingham.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Birmingham, UK');
    this.setDescription('Find gear, transport and technicians for concerts and tours on Sharingear in Birmingham, Denmark.');
};

LandingBirmingham.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Birmingham, UK');
};

module.exports = LandingBirmingham;