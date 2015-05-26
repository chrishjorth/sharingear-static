/**
 * Defines a list of tech profiles.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
	Model = require('../model.js'),
    App = require('../app.js'),
	TechProfile = require('./techprofile.js');

function TechProfileList(options) {
    Model.call(this, options);
}

TechProfileList.prototype = new Model();

TechProfileList.prototype.didInitialize = function() {
    if (this.data === null) {
        this.data = [];
    }
    this.token = App.user.token;
};

TechProfileList.prototype.search = function(location, gear, daterange, callback) {
    var view = this;

    if (location === null || location === '') {
        location = 'all';
    }
    this.get('/roadies/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(searchResults);
            callback(view.data);
        }
    });
};

TechProfileList.prototype.getUserTechProfiles = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/roadies', function(error, userGear) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(userGear);
            callback(view.data);
        }
    });
};

TechProfileList.prototype.getUserTechProfileRentals = function(userID, callback) {
    var view = this;
    this.get('/users/' + userID + '/roadierentals', function(error, userHires) {
        if (error) {
            console.error(error);
            callback([]);
        } else {
            view.loadFromArray(userHires);
            callback(view.data);
        }
    });
};

TechProfileList.prototype.getUserTechProfileReservations = function(userID, callback) {
    var view = this;

    view.get('/users/' + userID + '/roadiereservations', function(error, userBookings) {
        if (error) {
            callback([]);
        } else {
            view.loadFromArray(userBookings);
            callback(view.data);
        }
    });
};

TechProfileList.prototype.getTechProfileItem = function(property, key) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].data[property] === key) {
            return this.data[i];
        }
    }
    return null;
};

TechProfileList.prototype.isEmpty = function() {
    return this.data.length <= 0;
};

TechProfileList.prototype.updateTechProfileItem = function(techProfileItem) {
    var i;
    for (i = 0; i < this.data.length; i++) {
        if (this.data[i].id === techProfileItem.data.id) {
            this.data[i] = techProfileItem.data;
            return;
        }
    }
};

TechProfileList.prototype.loadFromArray = function(techProfileArray) {
    var i, techProfileItem;

    this.data = [];

    for (i = 0; i < techProfileArray.length; i++) {
        techProfileItem = new TechProfile({
            rootURL: this.rootURL
        });
        techProfileItem.initialize();
        _.extend(techProfileItem.data, techProfileArray[i]);
        this.data.push(techProfileItem);
    }
};

module.exports = TechProfileList;
