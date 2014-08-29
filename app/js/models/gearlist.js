/**
 * Defines a list of gear.
 * @author: Chris Hjorth
 */
define(
	['utilities', 'model', 'app'],
	function(Utilities, Model, App) {
		var GearList = Utilities.inherit(Model, {
			rootURL: App.API_URL,

			search: search
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
	}
);