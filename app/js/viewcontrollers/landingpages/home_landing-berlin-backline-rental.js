/**
 * Controller for the Sharingear Berlin Backline landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBerlinBackline(options) {
	Home.call(this, options);
}

LandingBerlinBackline.prototype = new Home();

LandingBerlinBackline.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Backline rental, Berlin');
    this.setDescription('Looking to find backline for your concert or tour in Berlin? Sharingear is your rental marketplace.');
};

LandingBerlinBackline.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find backline in Berlin, Germany');
};

module.exports = LandingBerlinBackline;