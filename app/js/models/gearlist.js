/**
 * Defines a list of gear.
 * @author: Chris Hjorth
 */
define(
	['model', 'models/gear'],
	function(Model, Gear) {
		var GearList = Model.inherit({
			data: [],
			
			search: search,
			getUserGear: getUserGear,
			getUserReservations: getUserReservations,
			getGearItem: getGearItem,
			listGear: listGear,
			isEmpty: isEmpty,
			updateGearItem: updateGearItem,
			loadFromArray: loadFromArray
		});

		return GearList;

		function search(location, gear, daterange, callback) {
			var view = this;

			this.get('/gear/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					//view.data = searchResults;
					view.loadFromArray(searchResults);
					callback(view.data);
				}
			});
		}

		function getUserGear(userID, callback) {
			var view = this;
			this.get('/users/' + userID + '/gear', function(error, userGear) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					//view.data = userGear;
					view.loadFromArray(userGear);
					callback(view.data);
				}
			});
		}

		function getUserReservations(userID, callback) {
			var view = this;
			this.get('/users/' + userID + '/reservations', function(error, userReservations) {
				if(error) {
					console.log(error);
					callback([]);
				}
				else {
					//view.data = userReservations;
					view.loadFromArray(userReservations);
					callback(view.data);
				}
			});
		}

		function getGearItem(gearID) {
			var i;
			for(i = 0; i < this.data.length; i++) {
				if(this.data[i].data.id === gearID) {
					return this.data[i];
				}
			}
			return null;
		}


		function listGear(gearArray, userID, callback) {
			var parsedGearArray = JSON.stringify(gearArray),
				postData;
			postData = {
				owner_id: userID,
				gear_list: parsedGearArray
			};

			this.post('/gearlist', postData, function(error, data) {
				if(callback && typeof callback === 'function') {
					callback(error);
				}
				return;
			});
		}

		function isEmpty() {
			return this.data.length <= 0;
		}

		function updateGearItem(gearItem) {
			var i;
			for(i = 0; i < this.data.length; i++) {
				if(this.data[i].id === gearItem.data.id) {
					this.data[i] = gearItem.data;
					return;
				}
			}
		}

		function loadFromArray(gearArray) {
			var i;
			for(i = 0; i < gearArray.length; i++) {
				this.data.push(new Gear.constructor({
					rootURL: this.rootURL,
					data: gearArray[i]
				}));
			}
		}
	}
);