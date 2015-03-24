/**
 * Defines the Sharingear classification of gear, vans and techs.
 * @author: Chris Hjorth
 */
//TODO: Store the classification locally so that it is always ready on load after the first time

/*jslint node: true */
'use strict';

var _ = require('underscore'),

    Model = require('../model'),

    didInitialize,
    getClassification;

didInitialize = function() {
    this.data = {};
    this.getClassification();
};

getClassification = function(callback) {
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

module.exports = Model.inherit({
    didInitialize: didInitialize,
    getClassification: getClassification
});
