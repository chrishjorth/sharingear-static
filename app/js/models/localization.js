/**
 * Defines a localization and locale data.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'config', 'model', 'models/xchangerates', 'moment', 'momenttz'],
	function(_, Utilities, Config, Model, XChangeRates, Moment) {
		var Localization,

            didInitialize,
            fetch,
			getCountries,
            getVAT,
            convertPrice,
            convertPrices,
            getTimeZones;

        didInitialize = function() {
            Moment.tz.setDefault('UTC');
        };

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
            XChangeRates.getRate('EUR', currency, function(error, rate) {
                if(error) {
                    callback('Error getting rate: ' + error);
                    return;
                }
                callback(null, price * rate);
            });
        };

        convertPrices = function(prices, fromCurrency, toCurrency, callback) {
            XChangeRates.getRate(fromCurrency, toCurrency, function(error, rate) {
                var i = 0,
                    convertedPrices = [];
                if(error) {
                    callback('Error getting rate: ' + error);
                    return;
                }
                for(i = 0; i < prices.length; i++) {
                    convertedPrices.push(prices[i] * rate);
                }
                callback(null, convertedPrices);
            });
        };

        getTimeZones = function() {
            var timezones = Moment.tz.names(),
                i, offset, j, temp;
            for(i = 0; i < timezones.length; i++) {
                offset = Moment.tz.zone(timezones[i]).offset(Moment.utc().valueOf()) * -1; //for some reason the offset is flipped
                offset /= 60; // convert to hours
                timezones[i] = {
                    name: timezones[i],
                    UTCOffset: offset
                };
                for(j = i; j > 0; j--) {
                    if(timezones[j].UTCOffset < timezones[j - 1].UTCOffset) {
                        temp = timezones[j];
                        timezones[j] = timezones[j - 1];
                        timezones[j - 1] = temp;
                    }
                    else if(timezones[j].UTCOffset === timezones[j - 1].UTCOffset && timezones[j].name < timezones[j - 1].name) {
                        temp = timezones[j];
                        timezones[j] = timezones[j - 1];
                        timezones[j - 1] = temp;
                    }
                    else {
                        j = 0;
                    }
                }
            }
            return timezones;
        };

        Localization = Model.inherit({
            didInitialize: didInitialize,
            fetch: fetch,
            getCountries: getCountries,
            getVAT: getVAT,
            convertPrice: convertPrice,
            convertPrices: convertPrices,
            getTimeZones: getTimeZones
        });
        Localization = new Localization.constructor({
            rootURL: Config.API_URL
        });
        Localization.fetch();

		return Localization;
	}
);
