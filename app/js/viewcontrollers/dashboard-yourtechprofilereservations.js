/**
 * Controller for the Sharingear Your Tech Profile reservations page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    TechProfileList = require('../models/techprofilelist.js'),

    reservationBlockID = 'yourreservations-techprofile-block';

function YourTechProfileReservations(options) {
    ViewController.call(this, options);
}

YourTechProfileReservations.prototype = new ViewController();

YourTechProfileReservations.prototype.didInitialize = function() {
    var view = this;
    view.techProfileList = new TechProfileList({
        rootURL: Config.API_URL
    });
    view.techProfileList.initialize();
    view.techProfileList.getUserTechProfileReservations(App.user.data.id, function() {
        view.didFetch = true;
        view.render();
    });
};

YourTechProfileReservations.prototype.didRender = function() {
    if(App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Tech profile reservations');
    }
    if (this.didFetch === true) {
        this.populateYourReservations();
    }

    this.setupEvent('click', '#yourreservations-techprofile-block .sg-list-item button', this, this.handleBooking);
};

YourTechProfileReservations.prototype.populateYourReservations = function(callback) {
    var view = this,
        YourReservationsItemTemplate;
    YourReservationsItemTemplate = require('../../templates/yourtechprofilereservations-item.html');

    var yourReservationsItemTemplate = _.template(YourReservationsItemTemplate),
        yourReserv = view.techProfileList.data,
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
        reservation = yourReserv[i];

        defaultReservation = {
            id: null,
            roadie_type: '',
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: '',
            model: '',
            images: '',
            img_url: 'images/placeholder_grey.png',
            price: 0,
            city: '',
            icon: reservation.data.roadie_type.replace(/\s/g, '').toLowerCase()
        };
        
        _.extend(defaultReservation, reservation.data);

        if (defaultReservation.images.length > 0) {
            defaultReservation.img_url = defaultReservation.images.split(',')[0];
        }

        $reservationItem = $(yourReservationsItemTemplate(defaultReservation));

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

YourTechProfileReservations.prototype.handleBooking = function(event) {
    var view = event.data,
        bookingID = $(this).data('bookingid'),
        techProfile, passedData;
    techProfile = view.techProfileList.getTechProfileItem('booking_id', bookingID);
    passedData = {
        techprofile: techProfile.data.roadie_type,
        techprofile_id: techProfile.data.id,
        mode: 'renter',
        booking_id: bookingID
    };
    App.router.openModalView('booking', passedData);
};

module.exports = YourTechProfileReservations;
