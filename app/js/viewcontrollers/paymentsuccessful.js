/**
 * Controller for the Sharingear payment success page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
	Moment = require('moment-timezone'),

	Config = require('../config.js'),
	App = require('../app.js'),

	Localization = require('../models/localization.js'),
	ViewController = require('../viewcontroller.js'),
	Booking = require('../models/booking.js');

function PaymentSuccessful(options) {
    ViewController.call(this, options);
}

PaymentSuccessful.prototype = new ViewController();

PaymentSuccessful.prototype.didInitialize = function() {
    var view = this,
        booking;

    view.paymentSuccessful = null; //null: waiting for server

    view.templateParameters = {
        item_name: this.passedData.item_name,
        start_date: '',
        end_date: '',
        currency: App.user.data.currency,
        vat: '',
        price: '',
        price_vat: '',
        fee: '',
        fee_vat: '',
        total: ''
    };

    booking = new Booking({
        rootURL: Config.API_URL
    });
    booking.initialize();
    booking.data.id = this.passedData.bookingID;
    booking.data.preauth_id = this.passedData.preAuthorizationID;
    booking.data.booking_status = 'pending';
    if (this.passedData.van_id) {
        booking.data.van_id = this.passedData.van_id;
    } else if (this.passedData.techprofile_id) {
        booking.data.techprofile_id = this.passedData.techprofile_id;
    } else {
        booking.data.gear_id = this.passedData.gear_id;
    }

    booking.update(App.user.data.id, function(error) {
        if (error) {
            console.error('Error updating booking: ' + error);
            view.paymentSuccessful = false;
            view.render();
            return;
        }
        booking.getBookingInfo(App.user.data.id, function(error) {
            //var startMoment, endMoment, duration, months, weeks, days, price, VAT, priceVAT, fee, feeVAT;
            var startMoment, endMoment, duration, months, weeks, days, price, fee;
            if (error) {
                console.error('Error getting booking info: ' + error);
                return;
            }

            startMoment = new Moment.tz(booking.data.start_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
            endMoment = new Moment.tz(booking.data.end_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());

            duration = Moment.duration(endMoment.diff(startMoment));
            months = parseInt(duration.months(), 10);
            endMoment.subtract(months, 'months');
            duration = Moment.duration(endMoment.diff(startMoment));
            weeks = parseInt(duration.weeks(), 10);
            endMoment.subtract(weeks, 'weeks');
            duration = Moment.duration(endMoment.diff(startMoment));
            days = parseInt(duration.days(), 10);

            price = booking.data.renter_price;
            //VAT = Localization.getVAT(App.user.data.country);
            //priceVAT = price / 100 * VAT;
            fee = price / 100 * App.user.data.buyer_fee;
            //feeVAT = fee / 100 * VAT;

            view.templateParameters = {
                item_name: view.passedData.item_name,
                start_date: startMoment.format('DD/MM/YYYY HH:mm'),
                end_date: endMoment.format('DD/MM/YYYY HH:mm'),
                currency: booking.data.renter_currency,
                //vat: VAT,
                vat: '',
                price: price,
                //price_vat: priceVAT,
                price_vat: '',
                fee: fee.toFixed(2),
                //fee_vat: feeVAT,
                fee_vat: '',
                //total: price + priceVAT + fee + feeVAT
                total: (price + fee).toFixed(2)
            };

            view.paymentSuccessful = true;
            view.render();
        });
    });

    this.setTitle('Sharingear - Booking confirmation');
    this.setDescription('If the reservation was successful your booking is confirmed and waiting for acceptance by the owner.');
};

PaymentSuccessful.prototype.didRender = function() {
    if (this.paymentSuccessful === true) {
        $('.payment-success', this.$element).removeClass('hidden');
    }
    if (this.paymentSuccessful === false) {
        $('.payment-failure', this.$element).removeClass('hidden');
    }
    this.setupEvent('click', '#paymentsuccessful-close-btn', this, this.handleClose);

    window.mixpanel.track('Payment successful');
};

PaymentSuccessful.prototype.handleClose = function() {
    App.router.setQueryString('');
    App.router.closeModalView();
};

module.exports = PaymentSuccessful;
