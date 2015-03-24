/**
 * Defines site configuration.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var IS_PRODUCTION = true, //This variable should be set and saved according to the git branch: true for master and false for develop
    MIN_USER_AGE = 13,
    AVG_USER_AGE = 27,
    MIN_XP_START_YEAR = 1960,
    FB_APP_ID = '522375581240221',
    FB_STATUSCHECK_TIMEOUT = 5000,
    API_URL,
    isProduction;

if (IS_PRODUCTION === true) {
    API_URL = 'https://prod-api.sharingear.com';
} else {
    API_URL = 'https://api.sharingear.com';
}

//API_URL = 'http://localhost:1338'; //Uncomment for testing local API

isProduction = function() {
    return (this.IS_PRODUCTION === true);
};

module.exports = {
    IS_PRODUCTION: IS_PRODUCTION,
    API_URL: API_URL,
    MIN_USER_AGE: MIN_USER_AGE,
    AVG_USER_AGE: AVG_USER_AGE,
    MIN_XP_START_YEAR: MIN_XP_START_YEAR,
    FB_APP_ID: FB_APP_ID,
    FB_STATUSCHECK_TIMEOUT: FB_STATUSCHECK_TIMEOUT,
    isProduction: isProduction
};
