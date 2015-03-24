/**
 * Defines a list of gear.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),

	Model = require('../model.js'),
	Gear = require('./gear.js'),
	
	didInitialize,

    search,
    getUserGear,
    getUserRentals,
    getUserReservations,
    getGearItem,
    isEmpty,
    updateGearItem,
    loadFromArray;

didInitialize = function() {
    if (this.data === null) {
        this.data = [];
    }
};

search = function(location, gear, daterange, callback) {
    var view = this;

    if (location === null || location === '') {
        location = 'all';
    }
    this.get('/gear/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
        if (error) {
            console.log(error);
            callback([]);
        } else {
            view.loadFromArray(searchResults);
            callback(view.data);
        }
    });
};

getUserGear = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/gear', function(error, userGear) {
        if (error) {
            console.log(error);
            callback([]);
        } else {
            view.loadFromArray(userGear);
            callback(view.data);
        }
    });
};

getUserRentals = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/gearrentals', function(error, userRentals) {
        if (error) {
            console.log(error);
            callback([]);
        } else {
            view.loadFromArray(userRentals);
            callback(view.data);
        }
    });
};

getUserReservations = function(userID, callback) {
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

getGearItem = function(property, key) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].data[property] === key) {
            return this.data[i];
        }
    }
    return null;
};

isEmpty = function() {
    return this.data.length <= 0;
};

updateGearItem = function(gearItem) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].id === gearItem.data.id) {
            this.data[i] = gearItem.data;
            return;
        }
    }
};

loadFromArray = function(gearArray) {
    var i, gearItem;

    this.data = [];

    for (i = 0; i < gearArray.length; i++) {
        gearItem = new Gear.constructor({
            rootURL: this.rootURL
        });
        gearItem.initialize();
        _.extend(gearItem.data, gearArray[i]);
        this.data.push(gearItem);
    }
};

module.exports = Model.inherit({
    didInitialize: didInitialize,

    search: search,
    getUserGear: getUserGear,
    getUserRentals: getUserRentals,
    getUserReservations: getUserReservations,
    getGearItem: getGearItem,
    isEmpty: isEmpty,
    updateGearItem: updateGearItem,
    loadFromArray: loadFromArray
});
