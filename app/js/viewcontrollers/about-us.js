/**
 * Controller for the Sharingear About us page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
    GoogleMaps = require('../libraries/mscl-googlemaps.js'),

    ViewController = require('../viewcontroller');

function AboutUs(options) {
    ViewController.call(this, options);
}

AboutUs.prototype = new ViewController();

AboutUs.prototype.didInitialize = function() {
    this.setTitle('Sharingear - About us');
    this.setDescription('Sharingear is the first trusted community marketplace for musicians and touring personnel. From musicians to musicians.');
};

AboutUs.prototype.didRender = function() {
    this.renderMap();
    this.loadFooter();
};

AboutUs.prototype.renderMap = function() {
    var view = this,
        mapOptions, latlong, marker;

    if (GoogleMaps.isLoaded() === false) {
        setTimeout(function() {
            view.renderMap();
        }, 10);
        return;
    }

    latlong = new GoogleMaps.LatLng(55.6805421, 12.6037284);
    mapOptions = {
        center: latlong,
        zoom: 14,
        maxZoom: 14
    };
    this.map = new GoogleMaps.Map(document.getElementById('aboutus-map'), mapOptions);
    marker = new GoogleMaps.Marker({
        position: latlong,
        map: this.map,
        icon: 'images/map_pin.png' // TODO: put icon on server
    });
};

AboutUs.prototype.loadFooter = function() {
    var view = this,
        FooterController, FooterTemplate;
    FooterController = require('./footer.js');
    FooterTemplate = require('../../templates/footer.html');

    view.footer = new FooterController({
        name: 'footer',
        $element: $('footer', view.$element),
        template: FooterTemplate
    });
    view.footer.initialize();
    view.footer.render();
};

module.exports = AboutUs;
