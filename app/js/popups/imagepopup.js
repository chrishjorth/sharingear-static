/**
 * Popup that requests a time.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    PopupController = require('../popupcontroller.js'),

    ImagePopupTemplate = require('./imagepopup.html'),

    wasClosed;

function ImagePopup(options) {
    PopupController.call(this, options);
    this.template = ImagePopupTemplate;
}

ImagePopup.prototype = new PopupController();

ImagePopup.prototype.didRender = function() {
    wasClosed = false;
    this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
};

ImagePopup.prototype.setImage = function(imageURL, altText) {
    $('#popup-image-container', this.$element).html('<img src="' + imageURL + '" alt="' + altText + '" />');
};

ImagePopup.prototype.getWasClosed = function() {
    return wasClosed;
};

ImagePopup.prototype.handleCancel = function(event) {
    var view = event.data;
    wasClosed = true;
    view.hide();
};

module.exports = ImagePopup;
