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
        expect(Config.isProduction);
    });

    it('Has correct API URL', function() {
        if (Config.isProduction() === true) {
            expect(Config.API_URL).to.equal('https://prod-api.sharingear.com');
        } else {
            expect(Config.API_URL).to.equal('https://api.sharingear.com');
        }
    });
});
