/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
    Moment = require('moment-timezone'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    Localization = require('../models/localization.js'),
    Booking = require('../models/booking.js'),

    SelectTimePopup = require('../popups/selecttime.js');

function BookingRequest(options) {
    ViewController.call(this, options);
}

BookingRequest.prototype = new ViewController();

BookingRequest.prototype.didInitialize = function() {
    var view = this;

    Moment.locale('en-custom', {
        week: {
            dow: 1,
            doy: 4
        }
    });

    this.owner = this.passedData.owner;

    this.bookingBtnEnabled = false;

    view.templateParameters = {
        item_name: this.passedData.item_name,
        currency: App.user.data.currency
    };

    if (this.passedData.booking) {
        this.newBooking = this.passedData.booking;
    } else {
        this.newBooking = new Booking({
            rootURL: Config.API_URL
        });
        this.newBooking.initialize();
        this.newBooking.data.gear_id = this.passedData.gear_id;
        this.newBooking.data.van_id = this.passedData.van_id;
        this.newBooking.data.techprofile_id = this.passedData.techprofile_id;
        this.newBooking.data.item_name = this.passedData.item_name;
        this.newBooking.data.price_a = this.passedData.price_a;
        this.newBooking.data.price_b = this.passedData.price_b;
        this.newBooking.data.price_c = this.passedData.price_c;
        this.newBooking.data.currency = this.passedData.currency;
    }
};

BookingRequest.prototype.didRender = function() {
    this.renderPricing();
    this.calculatePrice();
    this.renderCalendar();
    this.setupEvent('click', '#bookingrequest-cancel-btn', this, this.handleCancel);
    this.setupEvent('click', '#bookingrequest-next', this, this.handleNext);
    window.mixpanel.track('View bookingrequest');
};

BookingRequest.prototype.renderCalendar = function() {
    var view = this,
        $calendarContainer, passedData, CalendarVC, calendarVT;

    $calendarContainer = $('.pickupdeliverycalendar-container', view.$element);
    passedData = {
        availability: view.passedData.availability,
        alwaysFlag: view.passedData.alwaysFlag,
        parent: view
    };

    CalendarVC = require('./pickupdeliverycalendar.js');
    calendarVT = require('../../templates/pickupdeliverycalendar.html');

    view.calendarVC = new CalendarVC({
        name: 'pickupdeliverycalendar',
        $element: $calendarContainer,
        template: calendarVT,
        passedData: passedData
    });
    view.calendarVC.initialize();
    view.calendarVC.render();
};

BookingRequest.prototype.renderPricing = function() {
    var view = this;
    Localization.convertPrices([this.passedData.price_a, this.passedData.price_b, this.passedData.price_c], this.passedData.currency, App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.log('Error converting prices: ' + error);
            return;
        }
        $('.price_a', view.$element).html(Math.ceil(convertedPrices[0]));
        $('.price_b', view.$element).html(Math.ceil(convertedPrices[1]));
        $('.price_c', view.$element).html(Math.ceil(convertedPrices[2]));
    });
};

BookingRequest.prototype.calculatePrice = function() {
    var view = this,
        startMoment = new Moment.tz(this.newBooking.data.start_time, Localization.getCurrentTimeZone()),
        endMoment = new Moment.tz(this.newBooking.data.end_time, Localization.getCurrentTimeZone()),
        duration, months, weeks, days, hours;

    //Get number of months, get number of weeks from remainder, get number of days from remainder
    duration = Moment.duration(endMoment.diff(startMoment));
    months = parseInt(duration.months(), 10);
    endMoment.subtract(months, 'months');
    
    duration = Moment.duration(endMoment.diff(startMoment));
    weeks = parseInt(duration.weeks(), 10);
    endMoment.subtract(weeks, 'weeks');
    
    duration = Moment.duration(endMoment.diff(startMoment));
    days = parseInt(duration.days(), 10);  
    endMoment.subtract(days, 'days');

    duration = Moment.duration(endMoment.diff(startMoment));
    hours = parseInt(duration.hours(),10);

    //In case <24 hours are selected the user should pay for one day
    //In case 25 hours are selected, the user should pay for two days and so on
    //In case 6 days and 1 hour is selected, the user should pay for 1 week and so on
    if(hours!==0 && hours%24!==0){
            days++;    
        
        if (days===7) {
            weeks++;
            days = 0;
        }
        if(weeks===4){
            months++;
            weeks = 0;
        }
    }

    $('#bookingrequest-days', this.$element).html(days);
    $('#bookingrequest-weeks', this.$element).html(weeks);
    $('#bookingrequest-months', this.$element).html(months);

    Localization.convertPrices([this.passedData.price_a, this.passedData.price_b, this.passedData.price_c], this.passedData.currency, App.user.data.currency, function(error, convertedPrices) {
        var price;
        if (error) {
            console.log('Error converting prices: ' + error);
            return;
        }
        price = months * Math.ceil(convertedPrices[2]) + weeks * Math.ceil(convertedPrices[1]) + days * Math.ceil(convertedPrices[0]);
        
        $('#bookingrequest-price', view.$element).html(price);
    });
};

BookingRequest.prototype.handleCancel = function() {
    App.router.closeModalView();
};

BookingRequest.prototype.handlePickupSelection = function(calendarVC, callback) {
    var view = this,
        selectTimePopup = new SelectTimePopup();
    selectTimePopup.initialize();
    selectTimePopup.setTitle('Select pickup time');
    selectTimePopup.show();
    selectTimePopup.on('close', function(popup) {
        if (!popup.getWasClosed()) {
            var time = popup.getSelectedTime();
            calendarVC.pickupDate.hour(time.hours);
            calendarVC.pickupDate.minute(time.minutes);
            view.newBooking.data.start_time = new Moment.tz(calendarVC.pickupDate, Localization.getCurrentTimeZone());
            view.newBooking.data.end_time = null;
            view.calculatePrice();
            callback();
        }
    });
};

BookingRequest.prototype.handleDeliverySelection = function(calendarVC, isTimeSelected, callback) {
    var view = this,
        selectTimePopup;
    if (isTimeSelected === true) {
        view.newBooking.data.end_time = new Moment.tz(calendarVC.deliveryDate, Localization.getCurrentTimeZone());
        view.calculatePrice();
        return;
    }
    selectTimePopup = new SelectTimePopup();
    selectTimePopup.initialize();
    selectTimePopup.setTitle('Select delivery time');
    selectTimePopup.show();
    selectTimePopup.on('close', function(popup) {
        if (!popup.getWasClosed()) {
            var time = popup.getSelectedTime();
            calendarVC.deliveryDate.hour(time.hours);
            calendarVC.deliveryDate.minute(time.minutes);
            view.newBooking.data.end_time = new Moment.tz(calendarVC.deliveryDate, Localization.getCurrentTimeZone());
            view.calculatePrice();
            callback();
        }
    });
};

BookingRequest.prototype.handleNext = function(event) {
    var view = event.data,
        passedData;

    // check if time was selected
    if (view.newBooking.data.start_time === null || view.newBooking.data.end_time === null) {
        alert('No dates selected.');
        return;
    }

    passedData = {
        booking: view.newBooking,
        owner: view.owner
    };

    App.router.openModalSiblingView('payment', passedData);
};

module.exports = BookingRequest;
