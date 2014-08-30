/**
 * Defines a list of gear.
 * @author: Chris Hjorth
 */
define(
	['utilities', 'model'],
	function(Utilities, Model) {
		var GearList = Utilities.inherit(Model, {
			search: search,
			getUserGear: getUserGear
		});

		return GearList;

		function search(location, gear, daterange, callback) {
			this.get('/gear/search/' + location + '/' + gear + '/' + daterange, function(error, searchResults) {
				if(error) {
					callback([]);
				}
				else {
					callback(searchResults);
				}
			});
		}

		function getUserGear(userID, callback) {
			this.get('/users/' + userID + '/gear', function(error, userGear) {
				if(error) {
					callback([]);
				}
				else {
					callback(userGear);
				}
			});
		}
	}
);