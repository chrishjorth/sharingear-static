/**
 * Controller for the Sharingear Birmingham Vans landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingBirminghamVans(options) {
	Home.call(this, options);
}

LandingBirminghamVans.prototype = new Home();

LandingBirminghamVans.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Van, splitter and bus rental, Birmingham');
    this.setDescription('Looking to find a van, splitter or bus for your concert or tour in Birmingham? Sharingear is your rental marketplace.');
};

LandingBirminghamVans.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find band vehicles in Birmingham, UK');
    this.switchToTab('vans');
};

module.exports = LandingBirminghamVans;