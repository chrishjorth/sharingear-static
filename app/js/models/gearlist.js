/**
 * Defines a list of gear.
 * @author: Chris Hjorth
 */
define(
	['model'],
	function(Model) {
		var GearList = Model.inherit({
			search: search,
			getUserGear: getUserGear,
			getUserReservations: getUserReservations,
			getGearItem: getGearItem
		});

		return GearList;

		function search(location, gear, daterange, callback) {
			var view = this;
			this.get('/gear/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
				if(error) {
					callback([]);
				}
				else {
					view.data = searchResults;
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
					view.data = userGear;
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
					view.data = userReservations;
					callback(view.data);
				}
			});
		}

		function getGearItem(gearID) {
			var i;
			for(i = 0; i < this.data.length; i++) {
				if(this.data[i].id === gearID) {
					return this.data[i];
				}
			}
			return null;
		}
	}
);