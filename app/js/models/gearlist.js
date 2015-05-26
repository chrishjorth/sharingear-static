/**
 * Defines a list of gear.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),

	Model = require('../model.js'),
    App = require('../app.js'),
	Gear = require('./gear.js');

function GearList(options) {
    Model.call(this, options);
}

GearList.prototype = new Model();

GearList.prototype.didInitialize = function() {
    if (this.data === null) {
        this.data = [];
    }
    this.token = App.user.token;
};

GearList.prototype.search = function(location, gear, daterange, callback) {
    var view = this;

    if (location === null || location === '') {
        location = 'all';
    }
    this.get('/gear/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(searchResults);
            callback(view.data);
        }
    });
};

GearList.prototype.getUserGear = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/gear', function(error, userGear) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(userGear);
            callback(view.data);
        }
    });
};

GearList.prototype.getUserRentals = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/gearrentals', function(error, userRentals) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(userRentals);
            callback(view.data);
        }
    });
};

GearList.prototype.getUserReservations = function(userID, callback) {
    var view = this;

    view.get('/users/' + userID + '/gearreservations', function(error, userReservations) {
        if (error) {
            callback([]);
        } else {
            view.loadFromArray(userReservations);
            callback(view.data);
        }
    });
};

GearList.prototype.getGearItem = function(property, key) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].data[property] === key) {
            return this.data[i];
        }
    }
    return null;
};

GearList.prototype.isEmpty = function() {
    return this.data.length <= 0;
};

GearList.prototype.updateGearItem = function(gearItem) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].id === gearItem.data.id) {
            this.data[i] = gearItem.data;
            return;
        }
    }
};

GearList.prototype.loadFromArray = function(gearArray) {
    var i, gearItem;

    this.data = [];

    for (i = 0; i < gearArray.length; i++) {
        gearItem = new Gear({
            rootURL: this.rootURL
        });
        gearItem.initialize();
        _.extend(gearItem.data, gearArray[i]);
        this.data.push(gearItem);
    }
};

module.exports = GearList;
