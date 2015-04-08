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

AboutUs.prototype.didRender = function() {
    this.renderMap();
    this.loadFooter();
};

AboutUs.prototype.renderMap = function() {
    var mapOptions, latlong, marker;
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
