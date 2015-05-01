/**
 * Defines a list of vans.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),

    Model = require('../model'),
    Van = require('./van');

function VanList(options) {
    Model.call(this, options);
}

VanList.prototype = new Model();

VanList.prototype.didInitialize = function() {
    if (this.data === null) {
        this.data = [];
    }
};

VanList.prototype.search = function(location, gear, daterange, callback) {
    var view = this;

    if (location === null || location === '') {
        location = 'all';
    }
    this.get('/vans/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(searchResults);
            callback(view.data);
        }
    });
};

VanList.prototype.getUserVans = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/vans', function(error, userGear) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(userGear);
            callback(view.data);
        }
    });
};

VanList.prototype.getUserVanRentals = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/vanrentals', function(error, userRentals) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(userRentals);
            callback(view.data);
        }
    });
};

VanList.prototype.getUserVanReservations = function(userID, callback) {
    var view = this;

    view.get('/users/' + userID + '/vanreservations', function(error, userReservations) {
        if (error) {
            callback([]);
        } else {
            view.loadFromArray(userReservations);
            callback(view.data);
        }
    });
};

VanList.prototype.getVanItem = function(property, key) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].data[property] === key) {
            return this.data[i];
        }
    }
    return null;
};

VanList.prototype.isEmpty = function() {
    return this.data.length <= 0;
};

VanList.prototype.updateVanItem = function(vanItem) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].id === vanItem.data.id) {
            this.data[i] = vanItem.data;
            return;
        }
    }
};

VanList.prototype.loadFromArray = function(vanArray) {
    var i, vanItem;

    this.data = [];

    for (i = 0; i < vanArray.length; i++) {
        vanItem = new Van({
            rootURL: this.rootURL
        });
        vanItem.initialize();
        _.extend(vanItem.data, vanArray[i]);
        this.data.push(vanItem);
    }
};

module.exports = VanList;
