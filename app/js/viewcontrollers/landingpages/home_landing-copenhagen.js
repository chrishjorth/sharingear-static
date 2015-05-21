/**
 * Controller for the Sharingear Copenhagen landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingCopenhagen(options) {
	Home.call(this, options);
}

LandingCopenhagen.prototype = new Home();

LandingCopenhagen.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Copenhagen, Denmark');
    this.setDescription('Find gear, transport and technicians for concerts and tours on Sharingear in Copenhagen, Denmark.');
};

LandingCopenhagen.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Copenhagen, Denmark');
};

module.exports = LandingCopenhagen;