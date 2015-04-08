/**
 * General popup object that inherits from ViewController.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    ViewController = require('./viewcontroller.js'),

    $popupLightbox = $('#popup-lightbox'),
    PopupController;

function PopupController(options) {
    ViewController.call(this, options);
    this.$element = $('.popup-container', $popupLightbox);
    this.title = 'Popup';
}

PopupController.prototype = new ViewController();

PopupController.prototype.show = function() {
    $popupLightbox.removeClass('hidden');
    this.templateParameters.title = this.title;
    this.render();
};

PopupController.prototype.hide = function() {
    $popupLightbox.addClass('hidden');
    this.close();
};

PopupController.prototype.setTitle = function(title) {
    this.title = title;
};

module.exports = PopupController;
