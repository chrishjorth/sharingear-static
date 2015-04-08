/**
 * General view object with support for jQuery event autounbinding and localization.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery');

    //Utilities = require('./utilities.js');

function ViewController(options) {
    this.name = '';
    this.$element = $('');
    this.template = ''; //A template string
    this.templateParameters = {};
    this.labels = {};
    this.path = ''; //URL path in the following form mainView/subView fx dashboard/profile
    this.hasSubviews = false;
    this.$subViewContainer = $('');
    this.subPath = '';
    this.passedData = {}; //stores extra data passed to the view
    this.ready = true;

    _.extend(this, options);
}

/**
 * Allows reinitializing a views data.
 */
ViewController.prototype.initialize = function() {
    this.setSubPath();
    this.userEvents = [];
    this.events = {
        close: []
    };

    this.template = _.template(this.template);

    if (_.isFunction(this.didInitialize) === true) {
        this.didInitialize();
    }
};

ViewController.prototype.render = function(callback) {
    var template = this.template(this.templateParameters);

    //Unbind events to avoid double ups on multiple renders
    this.unbindEvents();
    if (_.isFunction(this.didResize) === true) {
        $(window).off('resize', this.didResize);
    }

    if (_.isFunction(this.willRender) === true) {
        this.willRender();
    }

    this.$element.html(template);

    //Did render event must be called before the callback so inheriting objects get the possibility to complete setup
    if (_.isFunction(this.didRender) === true) {
        this.didRender();
    }

    if (_.isFunction(callback) === true) {
        callback();
    }

    if (_.isFunction(this.didResize) === true) {
        $(window).on('resize', null, this, this.didResize);
    }
};

ViewController.prototype.setSubPath = function() {
    var slashIndex = -1;
    slashIndex = this.path.indexOf('/');
    if (slashIndex >= 0) {
        this.subPath = this.path.substring(slashIndex + 1);
    }
};

/*ViewController.prototype.localize = function($containerElement) {
    var $localizeElement = this.$element,
        key, $element;
    if ($containerElement) {
        $localizeElement = $containerElement;
    }
    for (key in this.labels) {
        if (this.labels.hasOwnProperty(key)) {
            $element = $('#' + key, $localizeElement);
            if ($element.is('input')) {
                $element.attr('placeholder', this.labels[key]);
            } else {
                $element.html(this.labels[key]);
            }
        }
    }
};*/

ViewController.prototype.close = function() {
    var i;
    for (i = 0; i < this.events.close.length; i++) {
        this.events.close[i](this);
    }
    this.unbindEvents();
    this.$element.empty();
    if (_.isFunction(this.didClose) === true) {
        this.didClose();
    }
};

//A wrapper for jQuery events that allows automatic unbinding on view disposal
ViewController.prototype.setupEvent = function(eventType, element, data, callback) {
    this.$element.on(eventType, element, data, callback);
    this.userEvents.push({
        eventType: eventType,
        element: element,
        callback: callback
    });
};

ViewController.prototype.unbindEvents = function() {
    var i, userEvent;
    for (i = this.userEvents.length - 1; i >= 0; i--) {
        userEvent = this.userEvents[i];
        this.$element.off(userEvent.eventType, userEvent.element, userEvent.callback);
        this.userEvents.pop();
    }
};

ViewController.prototype.on = function(eventType, callback) {
    switch (eventType) {
        case 'close':
            this.events.close.push(callback);
            break;
    }
};

module.exports = ViewController;
