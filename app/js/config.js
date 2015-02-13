/**
 * Defines site configuration.
 * @author: Chris Hjorth
 */
'use strict';

define(
	[],
	function() {
		var IS_PRODUCTION = true, //This variable should be set and saved according to the git branch: true for master and false for develop
			MIN_USER_AGE = 13,
			AVG_USER_AGE = 27,
			API_URL,
			isProduction;

		if(IS_PRODUCTION === true) {
			API_URL = 'https://prod-api.sharingear.com';
		}
		else {
			API_URL = 'https://api.sharingear.com';
		}

		//API_URL = 'http://localhost:1338'; //Uncomment for testing local API

		isProduction = function() {
			return (this.IS_PRODUCTION === true);
		};

		return {
			IS_PRODUCTION: IS_PRODUCTION,
			API_URL: API_URL,
			MIN_USER_AGE: MIN_USER_AGE,
			AVG_USER_AGE: AVG_USER_AGE,
			isProduction: isProduction
		};
	}
);