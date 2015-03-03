/**
 * Defines a list of tech profiles.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'model', 'models/techprofile'],
	function(_, Model, TechProfile) {
		var didInitialize,

			search,
			getUserTechProfiles,
			getUserTechProfileHires,
			getUserTechProfileBookings,
			getTechProfileItem,
			isEmpty,
			updateTechProfileItem,
			loadFromArray;

		didInitialize = function() {
			if(this.data === null) {
				this.data = [];
			}
		};

		search = function(location, gear, daterange, callback) {
			var view = this;

			if(location === null || location === '') {
				location = 'all';
			}
			this.get('/roadies/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					view.loadFromArray(searchResults);
					callback(view.data);
				}
			});
		};

		getUserTechProfiles = function(userID, callback) {
			var view = this;
			this.get('/users/' + userID + '/roadies', function(error, userGear) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					view.loadFromArray(userGear);
					callback(view.data);
				}
			});
		};

		getUserTechProfileHires = function(userID, callback) {
			var view = this;
			this.get('/users/' + userID + '/roadiehires', function(error, userHires) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					view.loadFromArray(userHires);
					callback(view.data);
				}
			});
		};

		getUserTechProfileBookings = function(userID, callback) {
			var view = this;
            
            view.get('/users/' + userID + '/roadiebookings', function (error, userBookings) {
            	if (error) {
            		callback([]);
            	}
            	else {
            		view.loadFromArray(userBookings);
            		callback(view.data);
            	}
            });
		};

		getTechProfileItem = function(property, key) {
			var i;
			for(i = 0; i < this.data.length; i++) {
				if(this.data[i].data[property] === key) {
					return this.data[i];
				}
			}
			return null;
		};

		isEmpty = function() {
			return this.data.length <= 0;
		};

		updateTechProfileItem = function(techProfileItem) {
			var i;
			for(i = 0; i < this.data.length; i++) {
				if(this.data[i].id === techProfileItem.data.id) {
					this.data[i] = techProfileItem.data;
					return;
				}
			}
		};

		loadFromArray = function(techProfileArray) {
			var i, techProfileItem;

            this.data = [];

			for(i = 0; i < techProfileArray.length; i++) {
                techProfileItem = new TechProfile.constructor({
                    rootURL: this.rootURL
                });
                techProfileItem.initialize();
                _.extend(techProfileItem.data, techProfileArray[i]);
				this.data.push(techProfileItem);
			}
		};

		return Model.inherit({
			didInitialize: didInitialize,

			search: search,
			getUserTechProfiles: getUserTechProfiles,
			getUserTechProfileHires: getUserTechProfileHires,
			getUserTechProfileBookings: getUserTechProfileBookings,
			getTechProfileItem: getTechProfileItem,
			isEmpty: isEmpty,
			updateTechProfileItem: updateTechProfileItem,
			loadFromArray: loadFromArray
		});
	}
);
