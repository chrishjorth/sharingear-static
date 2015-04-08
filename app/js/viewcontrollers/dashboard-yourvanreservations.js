/**
 * Controller for the Sharingear Your Van reservations page view.
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

    reservationBlockID = 'yourreservations-van-block';

function DashboardYourVanReservations(options) {
    ViewController.call(this, options);
}

DashboardYourVanReservations.prototype = new ViewController();

DashboardYourVanReservations.prototype.didInitialize = function() {
    var view = this;
    view.vanList = new VanList({
        rootURL: Config.API_URL
    });
    view.vanList.initialize();
    view.vanList.getUserVanReservations(App.user.data.id, function() {
        view.didFetch = true;
        view.render();
    });
};

DashboardYourVanReservations.prototype.didRender = function() {
    if(App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Van reservations');
    }
    if (this.didFetch === true) {
        this.populateYourReservations();
    }

    this.setupEvent('click', '#yourreservations-van-block .sg-list-item button', this, this.handleBooking);
};

DashboardYourVanReservations.prototype.populateYourReservations = function(callback) {
    var view = this,
        YourReservationsItemTemplate;
    YourReservationsItemTemplate = require('../../templates/yourvanreservations-item.html');

    var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
        yourReserv = view.vanList.data,
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
            van_type: '',
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: '',
            model: '',
            images: '',
            img_url: 'images/placeholder_grey.png',
            price: 0,
            city: ''
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

DashboardYourVanReservations.prototype.handleBooking = function(event) {
    var view = event.data,
        bookingID = $(this).data('bookingid'),
        van, passedData;
    van = view.vanList.getVanItem('booking_id', bookingID);
    passedData = {
        van: van.data.van_type + ' ' + van.data.model,
        van_id: van.data.id,
        mode: 'renter',
        booking_id: bookingID
    };
    App.router.openModalView('booking', passedData);
};

module.exports = DashboardYourVanReservations;
