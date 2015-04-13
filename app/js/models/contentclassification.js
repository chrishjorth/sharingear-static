/**
 * Defines the Sharingear classification of gear, vans and techs.
 * @author: Chris Hjorth
 */
//TODO: Store the classification locally so that it is always ready on load after the first time

/*jslint node: true */
'use strict';

var _ = require('underscore'),

    Config = require('../config.js'),
    Model = require('../model'),

    staticContentClassification;

function ContentClassification(options) {
    Model.call(this, options);
}

ContentClassification.prototype = new Model();

ContentClassification.prototype.didInitialize = function() {
    this.data = {};
};

ContentClassification.prototype.getClassification = function(callback) {
    var model = this;

    if (_.isEmpty(this.data) === false) {
        if (callback && typeof callback === 'function') {
            callback(this.data);
        }
        return;
    }

    this.get('/contentclassification', function(error, contentClassification) {
        if (error) {
            console.log(error);
            return;
        }
        model.data = contentClassification;
        if (callback && typeof callback === 'function') {
            callback(model.data);
        }
    });
};

staticContentClassification = new ContentClassification({
    rootURL: Config.API_URL
});
staticContentClassification.initialize();

module.exports = staticContentClassification;
