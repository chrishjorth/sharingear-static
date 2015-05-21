/**
 * Controller for the Sharingear Leeds Backline landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingLeedsBackline(options) {
	Home.call(this, options);
}

LandingLeedsBackline.prototype = new Home();

LandingLeedsBackline.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Backline rental, Leeds');
    this.setDescription('Looking to find backline for your concert or tour in Leeds? Sharingear is your rental marketplace.');
};

LandingLeedsBackline.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find backline in Leeds, UK');
};

module.exports = LandingLeedsBackline;