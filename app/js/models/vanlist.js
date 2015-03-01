/**
 * Defines a list of vans.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'model', 'models/van'],
	function(_, Model, Van) {
		var didInitialize,

			search,
			getUserVans,
			getUserVanRentals,
			getUserVanReservations,
			getVanItem,
			isEmpty,
			updateVanItem,
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
			this.get('/vans/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
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

		getUserVans = function(userID, callback) {
			var view = this;
			this.get('/users/' + userID + '/vans', function(error, userGear) {
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

		getUserVanRentals = function(userID, callback) {
			var view = this;
			this.get('/users/' + userID + '/vanrentals', function(error, userRentals) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					view.loadFromArray(userRentals);
					callback(view.data);
				}
			});
		};

		getUserVanReservations = function(userID, callback) {
			var view = this;
            
            view.get('/users/' + userID + '/vanreservations', function (error, userReservations) {
            	if (error) {
            		callback([]);
            	}
            	else {
            		view.loadFromArray(userReservations);
            		callback(view.data);
            	}
            });
		};

		getVanItem = function(property, key) {
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

		updateVanItem = function(vanItem) {
			var i;
			for(i = 0; i < this.data.length; i++) {
				if(this.data[i].id === vanItem.data.id) {
					this.data[i] = vanItem.data;
					return;
				}
			}
		};

		loadFromArray = function(vanArray) {
			var i, vanItem;

            this.data = [];

			for(i = 0; i < vanArray.length; i++) {
                vanItem = new Van.constructor({
                    rootURL: this.rootURL
                });
                vanItem.initialize();
                _.extend(vanItem.data, vanArray[i]);
				this.data.push(vanItem);
			}
		};

		return Model.inherit({
			didInitialize: didInitialize,

			search: search,
			getUserVans: getUserVans,
			getUserVanRentals: getUserVanRentals,
			getUserVanReservations: getUserVanReservations,
			getVanItem: getVanItem,
			isEmpty: isEmpty,
			updateVanItem: updateVanItem,
			loadFromArray: loadFromArray
		});
	}
);
