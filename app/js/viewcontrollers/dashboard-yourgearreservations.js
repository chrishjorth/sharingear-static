/**
 * Controller for the Sharingear Your reservations page view.
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

    reservationBlockID = 'yourreservations-gear-block';

function DashboardYourGearReservations(options) {
    ViewController.call(this, options);
}

DashboardYourGearReservations.prototype = new ViewController();

DashboardYourGearReservations.prototype.didInitialize = function() {
    var view = this;
    view.gearList = new GearList({
        rootURL: Config.API_URL
    });
    view.gearList.initialize();
    view.gearList.getUserReservations(App.user.data.id, function() {
        view.didFetch = true;
        view.render();
    });
};

DashboardYourGearReservations.prototype.didRender = function() {
    if(App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Gear reservations');
    }
    if (this.didFetch === true) {
        this.populateYourReservations();
    }

    this.setupEvent('click', '#yourreservations-gear-block .sg-list-item button', this, this.handleBooking);
};

DashboardYourGearReservations.prototype.populateYourReservations = function(callback) {
    var view = this,
        YourReservationsItemTemplate;
    YourReservationsItemTemplate = require('../../templates/yourgearreservations-item.html');
    var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
        yourReserv = view.gearList.data,
        $reservationBlock, defaultReservation, reservation, i, $reservationItem, status;

    if (yourReserv.length <= 0) {
        $('#' + reservationBlockID, view.$element).append('You currently do not have any reservations.');
        if (callback && typeof callback === 'function') {
            callback();
        }
        return;
    }

    $reservationBlock = $('#' + reservationBlockID, view.$element);

    for (i = 0; i < yourReserv.length; i++) {
        defaultReservation = {
            id: null,
            gear_type: '',
            subtype: '',
            brand: '',
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: '',
            model: '',
            images: '',
            img_url: 'images/placeholder_grey.png',
            price: 0,
            city: '',
            gear_status: 'status'
        };
        reservation = yourReserv[i];
        _.extend(defaultReservation, reservation.data);

        if (defaultReservation.images.length > 0) {
            defaultReservation.img_url = defaultReservation.images.split(',')[0];
        }

        $reservationItem = $(yourReservationsItemTemplate(defaultReservation));
        $('.sg-bg-image', $reservationItem).css({
            'background-image': 'url("' + defaultReservation.img_url + '")'
        });


        status = reservation.data.booking_status;

        if (status === 'pending' || status === 'waiting') {
            $('.request', $reservationItem).removeClass('hidden');
        }
        if (status === 'accepted' || status === 'rented-out' || status === 'renter-returned' || status === 'owner-returned' || status === 'ended') {
            $('.accepted', $reservationItem).removeClass('hidden');
        }
        if (status === 'denied' || status === 'ended-denied') {
            $('.denied', $reservationItem).removeClass('hidden');
        }

        $reservationBlock.append($reservationItem);
    }

    if (callback && typeof callback === 'function') {
        callback();
    }
};

DashboardYourGearReservations.prototype.handleBooking = function(event) {
    var view = event.data,
        bookingID = $(this).data('bookingid'),
        gear, passedData;
    gear = view.gearList.getGearItem('booking_id', bookingID);
    passedData = {
        item_name: gear.data.brand + ' ' + gear.data.model + ' ' + gear.data.subtype,
        gear_id: gear.data.id,
        mode: 'renter',
        booking_id: bookingID
    };
    App.router.openModalView('booking', passedData);
};

module.exports = DashboardYourGearReservations;
