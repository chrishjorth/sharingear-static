/**
 * @author: Chris Hjorth
 */

 'use strict';

define(
	['jquery', 'chai', 'sinon', 'config'],
	function($, chai, Sinon, Config) {
		var expect = chai.expect;
		
		describe('Config', function() {
			it('Provides the config object', function() {
				expect(Config).to.have.property('IS_PRODUCTION');
				expect(Config).to.have.property('API_URL');
				expect(Config.isProduction)
			});

			it('Has correct API URL', function() {
				if(Config.isProduction() === true) {
					expect(Config.API_URL).to.equal('https://prod-api.sharingear.com');
				}
				else {
					expect(Config.API_URL).to.equal('https://api.sharingear.com');
				}
			});
		});
	}
);