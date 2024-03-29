/**
 * Controller for the Sharingear pickup and delivery calendar view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
	$ = require('jquery'),
	Moment = require('moment-timezone'),

	Utilities = require('../utilities.js'),
	ViewController = require('../viewcontroller.js'),

	Localization = require('../models/localization.js'),

	pickupHintText = 'Select a pickup date',
    deliveryHintText = 'Select a delivery date';

function PickupDeliveryCalendar(options) {
    ViewController.call(this, options);
}

PickupDeliveryCalendar.prototype = new ViewController();

PickupDeliveryCalendar.prototype.didInitialize = function() {
    Moment.locale('en-custom', {
        week: {
            dow: 1,
            doy: 4
        }
    });

    this.pickupDate = null;
    if (this.passedData.pickupDate && Moment.isMoment(this.passedData.pickupDate) === true) {
        this.pickupDate = this.passedData.pickupDate;
        if (this.pickupDate.isBefore(this.displayedMoment) === true) {
            this.pickupDate = new Moment.tz(Localization.getCurrentTimeZone());
        }
        this.displayedPickupMonth = new Moment.tz(this.pickupDate, Localization.getCurrentTimeZone());
    } else {
        this.displayedPickupMonth = new Moment.tz(Localization.getCurrentTimeZone());
    }

    this.deliveryDate = null;
    if (this.passedData.deliveryDate && Moment.isMoment(this.passedData.deliveryDate) === true) {
        this.deliveryDate = this.passedData.deliveryDate;
        if (this.deliveryDate.isBefore(this.pickupDate) === true) {
            this.deliveryDate = new Moment.tz(this.pickupDate, Localization.getCurrentTimeZone());
            this.deliveryDate.add(1, 'days');
        }
        this.displayedDeliveryMonth = new Moment.tz(this.deliveryDate, Localization.getCurrentTimeZone());
    } else {
        this.displayedDeliveryMonth = new Moment.tz(this.displayedPickupMonth, Localization.getCurrentTimeZone());
    }

    this.pickupActive = true;
    if (this.passedData.pickupActive === false) {
        this.pickupActive = false;
    }

    this.availability = [];
    if (Array.isArray(this.passedData.availability) === true) {
        this.availability = this.passedData.availability;
    }
    this.alwaysFlag = 1; //1 = always available, 0 = never available
    if (this.passedData.alwaysFlag === 0 || this.passedData.alwaysFlag === 1) {
        this.alwaysFlag = this.passedData.alwaysFlag;
    }

    this.deliveryDateConfirmed = false; //Flag that confirms the user has selected a new deliverydate
};

PickupDeliveryCalendar.prototype.didRender = function() {
    var $calendarContainer = $('.calendar', this.$element),
        $pickupTab, $deliveryTab;

    this.renderMonthCalendar($calendarContainer);
    if (this.pickupActive === true) {
        this.populateMonthCalendar(this.displayedPickupMonth, $calendarContainer);
    } else {
        this.populateMonthCalendar(this.displayedDeliveryMonth, $calendarContainer);
    }

    $pickupTab = $('#pickupdeliverycalendar-pickupdate', this.$element);
    $deliveryTab = $('#pickupdeliverycalendar-deliverydate', this.$element);

    if (this.pickupActive === false) {
        $pickupTab.removeClass('sg-toptab-active');
        $deliveryTab.addClass('sg-toptab-active');
    }

    if (this.pickupDate !== null) {
        $('div', $pickupTab).html(this.pickupDate.format('DD/MM/YYYY'));
    }
    if (this.deliveryDate !== null) {
        $('div', $deliveryTab).html(this.deliveryDate.format('DD/MM/YYYY'));
    }


    if (this.deliveryDate !== null && this.pickupActive === false) {
        $('.hint', this.$element).html(deliveryHintText);
    } else {
        $('.hint', this.$element).html(pickupHintText);
    }

    this.setupEvent('click', '#pickupdeliverycalendar-prev', this, this.handlePrev);
    this.setupEvent('click', '#pickupdeliverycalendar-next', this, this.handleNext);
    this.setupEvent('click', '.day', this, this.handleDaySelection);
    this.setupEvent('click', '#pickupdeliverycalendar-pickupdate', this, this.handlePickupDateClick);
    this.setupEvent('click', '#pickupdeliverycalendar-deliverydate', this, this.handleDeliveryDateClick);
};

PickupDeliveryCalendar.prototype.renderMonthCalendar = function($monthCalendarContainer) {
    var header, dayRows, i;
    header = '<div class="row bs-reset calendar-header">';
    header += '<div class="col">Mo</div>';
    header += '<div class="col">Tu</div>';
    header += '<div class="col">We</div>';
    header += '<div class="col">Th</div>';
    header += '<div class="col">Fr</div>';
    header += '<div class="col">Sa</div>';
    header += '<div class="col">Su</div>';
    header += '</div>';
    dayRows = '';
    for (i = 0; i < 6; i++) {
        dayRows += '<div class="row bs-reset day-row">';
        dayRows += '<div class="col day"></div>';
        dayRows += '<div class="col day"></div>';
        dayRows += '<div class="col day"></div>';
        dayRows += '<div class="col day"></div>';
        dayRows += '<div class="col day"></div>';
        dayRows += '<div class="col day"></div>';
        dayRows += '<div class="col day"></div>';
        dayRows += '</div>';
    }
    $monthCalendarContainer.append(header + dayRows);
};

PickupDeliveryCalendar.prototype.populateMonthCalendar = function(moment, $calendarContainer) {
    var startDay = moment.date(1).weekday(),
        iteratorMoment, disable, isInInterval, $dayBox, row, col, date;

    iteratorMoment = new Moment.tz(moment, Localization.getCurrentTimeZone());

    $('#pickupdeliverycalendar-currentmonth', this.$element).html(moment.format('MMMM YYYY'));

    //Set date to first box
    iteratorMoment.subtract(startDay, 'days');
    for (row = 1; row <= 6; row++) { //6 possible week pieces
        for (col = 1; col <= 7; col++) { //7 days
            $dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col:nth-child(0n+' + col + ')', $calendarContainer);

            date = iteratorMoment.date();
            $dayBox.data('date', date);
            $dayBox.data('month', iteratorMoment.month() + 1);
            $dayBox.data('year', iteratorMoment.year());

            $dayBox.removeClass('disabled');
            disable = false;

            //Render date
            if (iteratorMoment.month() !== moment.month()) {
                //$dayBox.addClass('disabled');
                disable = true;
                $dayBox.html('');
            } else {
                $dayBox.html(date);
            }

            //Disable past days
            if (iteratorMoment.isBefore(new Moment.tz(Localization.getCurrentTimeZone()), 'day') === true) {
                disable = true;
                //$dayBox.addClass('disabled');
            }
            //In case of delivery selection disable days before or equal to pickup date
            if (this.pickupActive === false && (iteratorMoment.isBefore(this.pickupDate, 'day') === true || iteratorMoment.isSame(this.pickupDate, 'day') === true)) {
                disable = true;
                //$dayBox.addClass('disabled');
            }

            //Check if unavailable: if always flag = 0 and no interval, or flag = 1 and interval
            isInInterval = this.isDayInAvailability(iteratorMoment);
            if (this.alwaysFlag === 0 && isInInterval === false) {
                disable = true;
            }
            if (this.alwaysFlag === 1 && isInInterval === true) {
                disable = true;
            }

            if (disable === true) {
                $dayBox.addClass('disabled');
            }

            if (this.pickupActive === true && this.pickupDate !== null) {
                //We need to granulate to day, as pickupDate might have a pickup time set
                if (iteratorMoment.isSame(this.pickupDate, 'day') === true && iteratorMoment.isSame(this.pickupDate, 'month') === true && iteratorMoment.isSame(this.pickupDate, 'year') === true && iteratorMoment.isSame(moment, 'month') === true) {
                    $dayBox.addClass('selected');
                }
            }
            if (this.pickupActive === false && this.deliveryDate !== null) {
                if (iteratorMoment.isSame(this.pickupDate, 'day') === true && iteratorMoment.isSame(this.pickupDate, 'month') === true && iteratorMoment.isSame(this.pickupDate, 'year') === true && iteratorMoment.isSame(moment, 'month') === true) {
                    $dayBox.addClass('pickup');
                }

                if (iteratorMoment.isAfter(this.pickupDate, 'day') === true && iteratorMoment.isBefore(this.deliveryDate, 'day') === true && iteratorMoment.month() === this.displayedDeliveryMonth.month() && iteratorMoment.isSame(moment, 'month') === true) {
                    $dayBox.addClass('selected');
                }

                //We need to granulate to day, as deliveryDate might have a delivery time set
                if (iteratorMoment.isSame(this.deliveryDate, 'day') === true && iteratorMoment.isSame(this.deliveryDate, 'month') === true && iteratorMoment.isSame(this.deliveryDate, 'year') === true && iteratorMoment.isSame(moment, 'month') === true) {
                    $dayBox.addClass('selected');
                }
            }

            $dayBox.attr('id', 'calendar-day-' + iteratorMoment.format('YYYY-MM-DD'));
            iteratorMoment.add(1, 'days');
        }
    }
};

PickupDeliveryCalendar.prototype.clearSelections = function() {
    $('.day', this.$element).removeClass('selected');
    $('.day', this.$element).removeClass('pickup');
};

PickupDeliveryCalendar.prototype.handlePrev = function(event) {
    var view = event.data,
        $calendarContainer;

    view.clearSelections();

    $calendarContainer = $('.calendar', view.$element);
    if (view.pickupActive === true) {
        view.displayedPickupMonth.subtract(1, 'months');
        view.populateMonthCalendar(view.displayedPickupMonth, $calendarContainer);
    } else {
        view.displayedDeliveryMonth.subtract(1, 'months');
        view.populateMonthCalendar(view.displayedDeliveryMonth, $calendarContainer);
    }
};

PickupDeliveryCalendar.prototype.handleNext = function(event) {
    var view = event.data,
        $calendarContainer;

    view.clearSelections();

    $calendarContainer = $('.calendar', view.$element);
    if (view.pickupActive === true) {
        view.displayedPickupMonth.add(1, 'months');
        view.populateMonthCalendar(view.displayedPickupMonth, $calendarContainer);
    } else {
        view.displayedDeliveryMonth.add(1, 'months');
        view.populateMonthCalendar(view.displayedDeliveryMonth, $calendarContainer);

    }
};

PickupDeliveryCalendar.prototype.handleDaySelection = function(event) {
    var view = event.data,
        $dayBox = $(this),
        $pickupTab, $deliveryTab;

    if ($(this).hasClass('disabled') === true) {
        return;
    }

    $pickupTab = $('#pickupdeliverycalendar-pickupdate', view.$element);
    $deliveryTab = $('#pickupdeliverycalendar-deliverydate', view.$element);

    if (view.pickupActive === true) {
        //We are in the pickup tab
        view.pickupDate = new Moment.tz($dayBox.data('date') + '/' + $dayBox.data('month') + '/' + $dayBox.data('year'), 'DD/MM/YYYY', Localization.getCurrentTimeZone());

        $('div', $pickupTab).html(view.pickupDate.format('DD/MM/YYYY'));
        view.deliveryDate = null;
        $('div', $deliveryTab).html('-');

        if (_.isFunction(view.passedData.parent.handlePickupSelection) === true) {
            view.passedData.parent.handlePickupSelection(view, function() {
                view.switchToDeliveryTab();
            });
        } else {
            view.switchToDeliveryTab();
        }
    } else {
        //We are in the delivery tab
        view.deliveryDate = new Moment.tz($dayBox.data('date') + '/' + $dayBox.data('month') + '/' + $dayBox.data('year'), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
        //Check that delivery date is after pickup date
        if (view.deliveryDate.isBefore(view.pickupDate) === true || view.deliveryDate.isSame(view.pickupDate) === true) {
            return;
        }

        //Check if the delivery date ends an acceptable interval: if not alert error
        if (view.isIntervalAvailable(view.pickupDate, view.deliveryDate) === true) {
            $('div', $deliveryTab).html(view.deliveryDate.format('DD/MM/YYYY'));
            if (_.isFunction(view.passedData.parent.handleDeliverySelection) === true) {
                view.deliveryDateConfirmed = true;
                view.passedData.parent.handleDeliverySelection(view, false, function() {

                    if ($dayBox.hasClass('selected') === false) {
                        $dayBox.addClass('selected');
                    }

                    view.clearSelections();
                    view.populateMonthCalendar(view.displayedDeliveryMonth, $('.calendar', view.$element));

                });
            }
        } else {
            view.deliveryDate = null;
            alert('The interval you selected contains unavailable dates.');
            return;
        }

    }

};

PickupDeliveryCalendar.prototype.handlePickupDateClick = function(event) {
    var view = event.data,
        $pickupTab, $deliveryTab;

    if (view.pickupActive === false) {
        $pickupTab = $('#pickupdeliverycalendar-pickupdate', view.$element);
        $pickupTab.addClass('sg-toptab-active');
        $deliveryTab = $('#pickupdeliverycalendar-deliverydate', view.$element);
        $deliveryTab.removeClass('sg-toptab-active');

        view.pickupActive = true;
        $('.hint', view.$element).html(pickupHintText);
        view.clearSelections();
        view.populateMonthCalendar(view.displayedPickupMonth, $('.calendar', view.$element));
    }
};

PickupDeliveryCalendar.prototype.handleDeliveryDateClick = function(event) {
    var view = event.data;

    if (view.pickupActive === true && view.pickupDate !== null) {
        view.switchToDeliveryTab();
    }
};

PickupDeliveryCalendar.prototype.switchToDeliveryTab = function() {
    var $pickupTab, $deliveryTab;
    
    $pickupTab = $('#pickupdeliverycalendar-pickupdate', this.$element);
    $deliveryTab = $('#pickupdeliverycalendar-deliverydate', this.$element);

    $pickupTab.removeClass('sg-toptab-active');
    $deliveryTab.addClass('sg-toptab-active');
    this.pickupActive = false;

    $('.hint', this.$element).html(deliveryHintText);

    if (this.deliveryDate === null) {        
        this.deliveryDate = new Moment.tz(this.pickupDate, Localization.getCurrentTimeZone());
        this.deliveryDate.add(1, 'days');
        this.deliveryDate.hours(12);
    }

    $('div', $deliveryTab).html(this.deliveryDate.format('DD/MM/YYYY'));

    if (_.isFunction(this.passedData.parent.handleDeliverySelection) === true) {
        this.passedData.parent.handleDeliverySelection(this, true);
    }

    this.displayedDeliveryMonth = new Moment.tz(this.deliveryDate, Localization.getCurrentTimeZone());

    this.clearSelections();
    this.populateMonthCalendar(this.displayedDeliveryMonth, $('.calendar', this.$element));
};

PickupDeliveryCalendar.prototype.isDayInAvailability = function(moment) {
    var i, startMoment, endMoment;
    for (i = 0; i < this.availability.length; i++) {
        startMoment = new Moment.tz(this.availability[i].start, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
        endMoment = new Moment.tz(this.availability[i].end, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
        if (Utilities.isMomentBetween(moment, startMoment, endMoment) === true) {
            return true;
        }
    }
    return false;
};

/**
 * If always flag = 0 an interval with the moments must exist, if always flag = 1, an interval with the moments must not exists
 * and must not separate the two moments.
 * @assertion: startMoment and endMoment are available dates.
 */
PickupDeliveryCalendar.prototype.isIntervalAvailable = function(startMoment, endMoment) {
    var foundInterval = false,
        i = 0,
        intervalStartMoment, intervalEndMoment;
    while (i < this.availability.length && foundInterval === false) {
        intervalStartMoment = new Moment.tz(this.availability[i].start, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
        intervalEndMoment = new Moment.tz(this.availability[i].end, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
        if (Utilities.isMomentBetween(startMoment, intervalStartMoment, intervalEndMoment) === true && Utilities.isMomentBetween(endMoment, intervalStartMoment, intervalEndMoment) === true) {
            //The two moments are in an interval
            foundInterval = true;
        } else if (this.alwaysFlag === 1) {
            //Make sure that both moments are either after or before the interval, if not set found interval to true
            //TODO: Invert this if construct for conciceness
            if ((startMoment.isBefore(intervalStartMoment, 'day') === true && endMoment.isBefore(intervalStartMoment, 'day') === true) || (startMoment.isAfter(intervalEndMoment) === true && endMoment.isAfter(intervalEndMoment) === true)) {
                foundInterval = false;
            } else {
                foundInterval = true;
            }
        }
        i++;
    }
    if (this.alwaysFlag === 0) {
        return foundInterval;
    } else {
        return !foundInterval;
    }
};

module.exports = PickupDeliveryCalendar;
