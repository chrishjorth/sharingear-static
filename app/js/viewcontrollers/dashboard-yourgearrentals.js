/**
 * Controller for the Sharingear Your rentals dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    GearList = require('../models/gearlist.js'),

    gearBlockID,

    didInitialize,
    didRender,
    populateYourRentals,

    handleBooking;

gearBlockID = 'yourrentals-gear-block';

didInitialize = function() {
    var view = this;

    this.didFetch = false;
    this.gearList = new GearList.constructor({
        rootURL: Config.API_URL
    });
    this.gearList.initialize();
    this.gearList.getUserRentals(App.user.data.id, function() {
        view.didFetch = true;
        view.render();
    });
};

didRender = function() {
    if(App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Gear rentals');
    }

    if (this.didFetch === true) {
        this.populateYourRentals();
    }

    this.setupEvent('click', '#yourrentals-gear-block .sg-list-item button', this, this.handleBooking);
};

populateYourRentals = function(callback) {
    var view = this,
        YourRentalsItemTemplate;

    YourRentalsItemTemplate = require('../../templates/yourgearrentals-item.html');

    var yourRentalsItemTemplate = _.template(YourRentalsItemTemplate),
        yourRentals = view.gearList.data,
        displayedRentals = 0, //We do not display rentals with status waiting
        $gearBlock, defaultGear, gear, i, $gearItem, status;

    $gearBlock = $('#' + gearBlockID, view.$element);

    for (i = 0; i < yourRentals.length; i++) {
        defaultGear = {
            id: null,
            gear_type: '',
            subtype: '',
            brand: '',
            model: '',
            description: '',
            img_url: 'images/placeholder_grey.png',
            price_a: 0,
            price_b: 0,
            price_c: 0,
            owner_id: null,
            gear_status: 'unavailable'
        };

        gear = yourRentals[i];
        _.extend(defaultGear, gear.data);
        if (defaultGear.images.length > 0) {
            defaultGear.img_url = defaultGear.images.split(',')[0];
        }
        $gearItem = $(yourRentalsItemTemplate(defaultGear));
        $('.sg-bg-image', $gearItem).css({
            'background-image': 'url("' + defaultGear.img_url + '")'
        });


        status = gear.data.booking_status;
        if (status !== 'waiting') {
            if (status === 'pending') {
                $('.request', $gearItem).removeClass('hidden');
            }
            if (status === 'accepted' || status === 'rented-out' || status === 'renter-returned' || status === 'owner-returned' || status === 'ended') {
                $('.accepted', $gearItem).removeClass('hidden');
            }
            if (status === 'denied') {
                $('.denied', $gearItem).removeClass('hidden');
            }

            $gearBlock.append($gearItem);
            displayedRentals++;
        }
    }

    if (displayedRentals <= 0) {
        $('#' + gearBlockID, view.$element).append('You currently do not have any rentals.');
    } else {
        view.setupEvent('click', '.yourrentals-status.pending', view, view.handleGearItemPendConfirm);
        view.setupEvent('click', '.booking-btn', view, view.handleBooking);
    }

    if (callback && typeof callback === 'function') {
        callback();
    }
};

handleBooking = function(event) {
    var view = event.data,
        bookingID = $(this).data('bookingid'),
        gear, passedData;
    gear = view.gearList.getGearItem('booking_id', bookingID);
    passedData = {
        item_name: gear.data.brand + ' ' + gear.data.model + ' ' + gear.data.subtype,
        gear_id: gear.data.id,
        mode: 'owner',
        booking_id: bookingID
    };
    App.router.openModalView('booking', passedData);
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    populateYourRentals: populateYourRentals,

    handleBooking: handleBooking
});
