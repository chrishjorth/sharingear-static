/**
 * Controller for the Sharingear Settings page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    Moment = require('moment-timezone'),
	ViewController = require('../viewcontroller.js'),
	App = require('../app.js'),
    Config = require('../config.js'),
    MessagePopup = require('../popups/messagepopup.js'),

	Localization = require('../models/localization.js');

function DashboardSettings(options) {
    ViewController.call(this, options);
}

DashboardSettings.prototype = new ViewController();

DashboardSettings.prototype.didInitialize = function() {
    var userData;

    if (App.user.data.id === null) {
        this.ready = false;
        App.router.navigateTo('home');
        return;
    }

    this.user = App.user;

    userData = this.user.data;
    this.isSaving = false;


    this.selectedTimeZone = Localization.getCurrentTimeZone();
};

DashboardSettings.prototype.didRender = function() {
     var view = this,
        userData = this.user.data,
        birthdate, $countriesSelect, $nationalitiesSelect;

    this.populateTimeZones();

    this.populateBirthdateInput();
    if (userData.birthdate !== null) {
        birthdate = new Moment.tz(userData.birthdate, 'YYYY-M-D', Localization.getCurrentTimeZone());
        $('#dashboard-settings-birthdate-year', view.$element).val(birthdate.year());
        $('#dashboard-settings-birthdate-month', view.$element).val(birthdate.month() + 1);
        $('#dashboard-settings-birthdate-date', view.$element).val(birthdate.date());
    }

    $('#dashboard-settings-vatnum', this.$element).val(userData.vatnum);
    $('#dashboard-settings-address', this.$element).val(userData.address);
    $('#dashboard-settings-postalcode', view.$element).val(userData.postal_code);
    $('#dashboard-settings-form #hometown', this.$element).val(userData.city);

    $countriesSelect = $('#dashboard-settings-country', this.$element);
    this.populateCountries($countriesSelect);
    $countriesSelect.val(userData.country);


    $('#dashboard-settings-phone', view.$element).val(userData.phone);

    $nationalitiesSelect = $('#dashboard-settings-nationalities', this.$element);
    this.populateCountries($nationalitiesSelect);
    $nationalitiesSelect.val(userData.nationality);


    this.setupEvent('click','.private-field-lock', this, this.handlePrivatePopup);
    this.setupEvent('change', '#dashboard-settings-birthdate-year, #dashboard-settings-birthdate-month', this, this.handleBirthdateChange);
    this.setupEvent('submit', '#dashboard-settings-form', this, this.handleSave);
};

DashboardSettings.prototype.handleBirthdateChange = function(event) {
    var view = event.data;
    view.populateBirthdateInput();
};

DashboardSettings.prototype.handlePrivatePopup = function(event) {
    var view = event.data;
    var messagePopup = new MessagePopup();
    var message = '<div class="row" style="text-align:center;"><i class="fa fa-lock fa-5x private-field-lock" style="color:rgb(254, 181, 0)"></i></div><div class="row" style="padding: 0 20px;">This information is private, and it will not be shared in public or with any other user.</div>';

    messagePopup.initialize();
    messagePopup.show();
    messagePopup.setMessage(message);
};

DashboardSettings.prototype.populateCountries = function($select) {
    var countriesArray = Localization.getCountries(),
        html = $('option', $select).first()[0].outerHTML,
        i;

    for (i = 0; i < countriesArray.length; i++) {
        html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m) {
            return m.toUpperCase();
        }) + '</option>';
    }
    $select.html(html);
};

DashboardSettings.prototype.populateBirthdateInput = function() {
    var $inputContainer = $('.birthday-select', this.$element),
        $selectDay = $('#dashboard-settings-birthdate-date', $inputContainer),
        $selectMonth = $('#dashboard-settings-birthdate-month', $inputContainer),
        $selectYear = $('#dashboard-settings-birthdate-year', $inputContainer),
        html = '<option> - </option>',
        today = new Moment.tz(Localization.getCurrentTimeZone()),
        selectedYear = null,
        selectedMonth = null,
        selectedDay = null,
        maxYear, monthDays, i;

    selectedYear = $selectYear.val();
    maxYear = today.year() - Config.MIN_USER_AGE;
    for (i = 1914; i <= maxYear; i++) {
        html += '<option value="' + i + '">' + i + '</option>';
    }
    $selectYear.html(html);
    if (selectedYear !== null && selectedYear !== '-') {
        $selectYear.val(selectedYear);
    } else {
        selectedYear = new Moment.tz(Localization.getCurrentTimeZone()).format('YYYY');
    }

    selectedMonth = $selectMonth.val();
    html = '<option> - </option>';
    for (i = 1; i <= 12; i++) {
        html += '<option value="' + i + '">' + i + '</option>';
    }
    $selectMonth.html(html);
    if (selectedMonth !== null) {
        $selectMonth.val(selectedMonth);
    }

    selectedDay = $selectDay.val();
    monthDays = new Moment.tz(selectedYear + '-' + selectedMonth + '-' + 1, 'YYYY-M-D', Localization.getCurrentTimeZone());
    monthDays = monthDays.endOf('month').date();
    html = '<option> - </option>';
    for (i = 1; i <= monthDays; i++) {
        html += '<option value="' + i + '">' + i + '</option>';
    }
    $selectDay.html(html);

    if (selectedDay !== null) {
        if (selectedDay <= monthDays) {
            $selectDay.val(selectedDay);
        } else {
            $selectDay.val('-');
        }
    } else {
        $selectDay.val('-');
    }

    html = '';
};

DashboardSettings.prototype.populateTimeZones = function() {
    var timezones = Localization.getTimeZones(),
        $timezonesSelect = $('#dashboard-settings-timezone', this.$element),
        html = '',
        i, defaultTimezone;

    if (App.rootVC.header) {
        App.rootVC.header.setTitle('Settings');
    }

    for (i = 0; i < timezones.length; i++) {
        html += '<option value="' + timezones[i].name + '">' + timezones[i].name + ' (' + (timezones[i].UTCOffset > 0 ? '+' : '') + timezones[i].UTCOffset + ' UTC)</option>';
    }
    $timezonesSelect.html(html);

    defaultTimezone = this.selectedTimeZone;
    $timezonesSelect.val(defaultTimezone);
};

DashboardSettings.prototype.handleSave = function(event) {
    var view = event.data,
        selectedTimeZone, $successMessage, $saveBtn, birthdate, saveData;

    selectedTimeZone = $('#dashboard-settings-timezone', view.$element).val();
    $successMessage = $('#dashboard-settings-savesuccess', view.$element);
    $saveBtn = $('#dashboard-settings-savebtn', view.$element);

    $successMessage.addClass('hidden');

    if (view.isSaving === true) {
        return;
    }

    birthdate = $('#dashboard-settings-birthdate-year', view.$element).val() + '-' + $('#dashboard-settings-birthdate-month', view.$element).val() + '-' + $('#dashboard-settings-birthdate-date', view.$element).val();
    birthdate = new Moment.tz(birthdate, 'YYYY-M-D', true, Localization.getCurrentTimeZone());

    saveData = {
        city: $('#dashboard-settings-form #hometown', view.$element).val(),
        bio: $('#dashboard-settings-form #bio', view.$element).val(),
        birthdate: birthdate.format('YYYY-M-D'),
        address: $('#dashboard-settings-address', view.$element).val(),
        postal_code: $('#dashboard-settings-postalcode', view.$element).val(),
        country: $('#dashboard-settings-country', view.$element).val(),
        phone: $('#dashboard-settings-phone', view.$element).val(),
        nationality: $('#dashboard-settings-nationalities', view.$element).val(),
        vatnum: $('#dashboard-settings-vatnum', this.$element).val()
    };

    if (birthdate.isValid() === false) {
        alert('Please select a valid date of birth');
        return;
    }

    if ($('#dashboard-settings-form #dashboard-settings-address', view.$element).val() === '') {
        alert('The address field is required.');
        return;
    }

    if ($('#dashboard-settings-form #dashboard-settings-postalcode', view.$element).val() === '') {
        alert('The postal code field is required.');
        return;
    }

    if ($('#dashboard-settings-form #hometown', view.$element).val() === '') {
        alert('The city field is required.');
        return;
    }

    if ($('#dashboard-settings-form #dashboard-settings-country', view.$element).val() === '') {
        alert('The country field is required.');
        return;
    }

    if ($('#dashboard-settings-form #dashboard-settings-phone', view.$element).val() === '') {
        alert('The phone field is required.');
        return;
    }

    if ($('#dashboard-settings-form #dashboard-settings-nationalities', view.$element).val() === '') {
        alert('The nationality field is required.');
        return;
    }
    view.isSaving = true;
    $saveBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
    _.extend(view.user.data, saveData);


    App.user.data.time_zone = selectedTimeZone;
    App.user.update(function(error) {
        view.isSaving = false;
        if (error) {
            alert('Error saving settings.');
            console.error('Error saving settings: ' + error);
            return;
        }
        $successMessage.removeClass('hidden');
        $saveBtn.html('Save');
    });

};

module.exports = DashboardSettings;
