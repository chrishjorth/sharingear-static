/**
 * Defines a localization and locale data.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'config', 'model', 'models/xchangerates'],
	function(_, Utilities, Config, Model, XChangeRates) {
		var Localization,

            fetch,
			getCountries,
            getVAT,
            convertPrice;

		fetch = function() {
            var model = this;
            this.get('/localization', function(error, data) {
                if(error) {
                    console.log('Error retrieving localization data.');
                    return;
                }
                model.data = data;
            });
        };

		getCountries = function() {
			var countriesArray = [],
                i;
			for(i = 0; i < this.data.length; i++) {
                countriesArray.push({
                    name: this.data[i].name,
                    code: this.data[i].code
                });
            }
			return countriesArray;
		};

        getVAT = function(countryCode) {
            var i;
            for(i = 0; i < this.data.length; i++) {
                if(this.data[i].code === countryCode) {
                    return this.data[i].vat;
                }
            }
            return null;
        };

        /**
         * @param price: the price in EURO to convert.
         * @param currency: the currency to convert to.
         */
        convertPrice = function(price, currency, callback) {
            XChangeRates.getRate(currency, function(error, rate) {
                if(error) {
                    callback('Error getting rate: ' + error);
                    return;
                }
                callback(null, price * rate);
            });
        };

        Localization = Model.inherit({
            fetch: fetch,
            getCountries: getCountries,
            getVAT: getVAT,
            convertPrice: convertPrice
        });
        Localization = new Localization.constructor({
            rootURL: Config.API_URL
        });
        Localization.fetch();

		return Localization;
	}
);
