/**
 * Controller for the Sharingear Copenhagen Instruments landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var Home = require('../home.js'),
    App = require('../../app.js');

function LandingCopenhagenInstruments(options) {
	Home.call(this, options);
}

LandingCopenhagenInstruments.prototype = new Home();

LandingCopenhagenInstruments.prototype.didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.setTitle('Sharingear - Musical instruments rental, Copenhagen');
    this.setDescription('Looking to find instruments for your concert or tour in Copenhagen? Sharingear is your rental marketplace.');
};

LandingCopenhagenInstruments.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.renderTestimonials();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);

    window.mixpanel.track('View home');

    this.setSubtitle('Find instruments in Copenhagen, Denmark');
};

module.exports = LandingCopenhagenInstruments;