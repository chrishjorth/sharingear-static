/**
 * Controller for the Sharingear Settings page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
	
	ViewController = require('../viewcontroller.js'),
	App = require('../app.js'),

	Localization = require('../models/localization.js'),

	didInitialize,
    didRender,
    populateTimeZones,

    handleSave;

didInitialize = function() {
    this.selectedTimeZone = Localization.getCurrentTimeZone();
};

didRender = function() {
    this.populateTimeZones();

    this.setupEvent('submit', '#dashboard-settings-form', this, this.handleSave);
};

populateTimeZones = function() {
    var timezones = Localization.getTimeZones(),
        $timezonesSelect = $('#dashboard-settings-timezone', this.$element),
        html = '',
        i, defaultTimezone;

    if (App.header) {
        App.header.setTitle('Settings');
    }

    for (i = 0; i < timezones.length; i++) {
        html += '<option value="' + timezones[i].name + '">' + timezones[i].name + ' (' + (timezones[i].UTCOffset > 0 ? '+' : '') + timezones[i].UTCOffset + ' UTC)</option>';
    }
    $timezonesSelect.html(html);

    defaultTimezone = this.selectedTimeZone;
    $timezonesSelect.val(defaultTimezone);
};

handleSave = function(event) {
    var view = event.data,
        selectedTimeZone, $successMessage, $saveBtn;

    selectedTimeZone = $('#dashboard-settings-timezone', view.$element).val();
    $successMessage = $('#dashboard-settings-savesuccess', view.$element);
    $saveBtn = $('#dashboard-settings-savebtn', view.$element);

    $successMessage.addClass('hidden');
    $saveBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

    if (selectedTimeZone !== view.selectedTimeZone) {
        App.user.data.time_zone = selectedTimeZone;
        App.user.update(function(error) {
            if (error) {
                alert('Error saving settings.');
                console.log('Error saving settings: ' + error);
                return;
            }
            $successMessage.removeClass('hidden');
            $saveBtn.html('Save');
        });
    }
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    populateTimeZones: populateTimeZones,

    handleSave: handleSave
});
