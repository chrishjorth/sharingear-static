/**
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var chai = require('chai'),
	
	Config = require('../../../js/config.js'),

	expect;

expect = chai.expect;

describe('Config', function() {
    it('Provides the config object', function() {
        expect(Config).to.have.property('IS_PRODUCTION');
        expect(Config).to.have.property('API_URL');
        expect(Config).to.have.property('MIN_USER_AGE');
        expect(Config).to.have.property('AVG_USER_AGE');
        expect(Config).to.have.property('MIN_XP_START_YEAR');
    });

    it('Has correct API URL', function() {
        if (Config.isProduction() === true) {
            expect(Config.API_URL).to.equal('https://prod-api.sharingear.com');
        } 
        else if(Config.isProduction() === false) {
            expect(Config.API_URL).to.equal('https://api.sharingear.com');
        }
        else {
            console.log('Something is wrong');
            expect(true).to.equal(false);
        }
    });
});
