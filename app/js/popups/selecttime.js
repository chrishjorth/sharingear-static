/**
 * Popup that requests a time.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

	PopupController = require('../popupcontroller'),
	SelectTimePopupTemplate = require('./selecttime.html'),

    wasClosed;

function SelectTime(options) {
    PopupController.call(this, options);
    this.template = SelectTimePopupTemplate;
}

SelectTime.prototype = new PopupController();

SelectTime.prototype.didRender = function() {
    wasClosed = false;
    this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
    this.setupEvent('click', '.confirm-btn', this, this.handleConfirm);
};

SelectTime.prototype.getSelectedTime = function() {
    return {
        hours: parseInt($('#selecttimepopup-hours', this.$element).val(), 10),
        minutes: parseInt($('#selecttimepopup-minutes', this.$element).val(), 10)
    };
};

SelectTime.prototype.getWasClosed = function() {
    return wasClosed;
};

SelectTime.prototype.handleConfirm = function(event) {
    var view = event.data;
    wasClosed = false;
    view.hide();
};

SelectTime.prototype.handleCancel = function(event) {
    var view = event.data;
    wasClosed = true;
    $('#selecttimepopup-hours', this.$element).val('12');
    $('#selecttimepopup-minutes', this.$element).val('00');
    view.hide();
};

module.exports = SelectTime;
