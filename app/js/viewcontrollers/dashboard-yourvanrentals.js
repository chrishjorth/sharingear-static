/**
 * Controller for the Sharingear Your Van rentals dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    VanList = require('../models/vanlist.js'),

    vanBlockID = 'yourrentals-van-block';

function DashboardYourVanRentals(options) {
    ViewController.call(this, options);
}

DashboardYourVanRentals.prototype = new ViewController();

DashboardYourVanRentals.prototype.didInitialize = function() {
    var view = this;

    this.didFetch = false;
    this.vanList = new VanList({
        rootURL: Config.API_URL
    });
    this.vanList.initialize();
    this.vanList.getUserVanRentals(App.user.data.id, function() {
        view.didFetch = true;
        view.render();
    });
};

DashboardYourVanRentals.prototype.didRender = function() {
    if(App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Van rentals');
    }

    if (this.didFetch === true) {
        this.populateYourRentals();
    }

    this.setupEvent('click', '#yourrentals-van-block .sg-list-item button', this, this.handleBooking);
};

DashboardYourVanRentals.prototype.populateYourRentals = function(callback) {
    var view = this,
        YourRentalsItemTemplate;
    YourRentalsItemTemplate = require('../../templates/yourvanrentals-item.html');
    var yourRentalsItemTemplate = _.template(YourRentalsItemTemplate),
        yourRentals = view.vanList.data,
        displayedRentals = 0, //We do not display rentals with status waiting
        $vanBlock, defaultVan, van, i, $vanItem, status;

    $vanBlock = $('#' + vanBlockID, view.$element);

    for (i = 0; i < yourRentals.length; i++) {
        defaultVan = {
            id: null,
            van_type: '',
            subtype: '',
            brand: '',
            model: '',
            description: '',
            img_url: 'images/placeholder_grey.png',
            price_a: 0,
            price_b: 0,
            price_c: 0,
            owner_id: null
        };

        van = yourRentals[i];
        _.extend(defaultVan, van.data);
        if (defaultVan.images.length > 0) {
            defaultVan.img_url = defaultVan.images.split(',')[0];
        }
        $vanItem = $(yourRentalsItemTemplate(defaultVan));
        $('.sg-bg-image', $vanItem).css({
            'background-image': 'url("' + defaultVan.img_url + '")'
        });


        status = van.data.booking_status;
        if (status !== 'waiting') {
            if (status === 'pending') {
                $('.request', $vanItem).removeClass('hidden');
            }
            if (status === 'accepted' || status === 'rented-out' || status === 'renter-returned' || status === 'owner-returned' || status === 'ended') {
                $('.accepted', $vanItem).removeClass('hidden');
            }
            if (status === 'denied') {
                $('.denied', $vanItem).removeClass('hidden');
            }

            $vanBlock.append($vanItem);
            displayedRentals++;
        }
    }

    if (displayedRentals <= 0) {
        $('#' + vanBlockID, view.$element).append('You currently do not have any rentals.');
    } else {
        view.setupEvent('click', '.booking-btn', view, view.handleBooking);
    }

    if (callback && typeof callback === 'function') {
        callback();
    }
};

DashboardYourVanRentals.prototype.handleBooking = function(event) {
    var view = event.data,
        bookingID = $(this).data('bookingid'),
        van, passedData;
    van = view.vanList.getVanItem('booking_id', bookingID);
    passedData = {
        van: van.data.van_type + ' ' + van.data.model,
        van_id: van.data.id,
        mode: 'owner',
        booking_id: bookingID
    };
    App.router.openModalView('booking', passedData);
};

module.exports = DashboardYourVanRentals;
