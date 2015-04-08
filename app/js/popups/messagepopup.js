/**
 * Popup that requests a time.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    PopupController = require('../popupcontroller.js'),

    MessagePopupTemplate = require('./messagepopup.html'),

    wasClosed;

function MessagePopup(options) {
    PopupController.call(this, options);
    this.template = MessagePopupTemplate;
}

MessagePopup.prototype = new PopupController();

MessagePopup.prototype.didRender = function() {
    wasClosed = false;
    this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
};

MessagePopup.prototype.setMessage = function(message) {
    $('#popup-message', this.$element).html(message);
};

MessagePopup.prototype.getWasClosed = function() {
    return wasClosed;
};

MessagePopup.prototype.handleCancel = function(event) {
    var view = event.data;
    wasClosed = true;
    view.hide();
};

module.exports = MessagePopup;
