/**
 * Defines a localization and locale data.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'config', 'model', 'models/xchangerates', 'moment'],
	function(_, Utilities, Config, Model, XChangeRates, Moment) {
		var Localization,

            didInitialize,
            fetch,
			getCountries,
            getVAT,
            convertPrice,
            convertPrices,
            getTimeZones,
            getLocalTimeZone,
            getCurrentTimeZone,
            setCurrentTimeZone;

        didInitialize = function() {
            this.defaultTimeZone = this.getLocalTimeZone();
            this.currenTimezone = this.defaultTimeZone;
            if(this.data === null) {
                this.data = [];
            }
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

        /**
         * Moment.js is missing a way to get the local timezone name.
         * See following links for problem info:
         * https://github.com/moment/moment-timezone/issues/138
         * http://codeofmatt.com/2013/06/07/javascript-date-type-is-horribly-broken/
         * This approach is based on https://github.com/Canop/tzdetect.js and optimized for speed since the version in the link is quite slow.
         * We use a naive approach and return the first match, since it is currently not possible to narrow down the results to one timezone anyhow.
         */
        getLocalTimeZone = function() {
            var now = Date.now(),
                makekey, localkey, names, i;

            //The key identifies a timezone by specific time points in a year. Note that this might become wrong when the timezones change for some reason as they sometimes do.
            makekey = function(id){
                //return [0, 4, 8, -5 * 12, 4 - 5 * 12, 8 - 5 * 12, 4 - 2 * 12, 8 - 2 * 12].map(function(months) {
                return [0, 4, 8, -60, -56, -52, -20, -16].map(function(months) {
                    //var m = new Moment(now + months * 30 * 24 * 60 * 60 * 1000);
                    var m = new Moment(now + months * 2592000000);
                    if(id) {
                        m.tz(id);
                    }
                    return m.format('DDHHmm');
                }).join(' ');
            };

            localkey = makekey();

            names = Moment.tz.names();

            i = 0;
            while(i < names.length) {
                if(makekey(names[i]) === localkey) {
                    return names[i];
                }
                i++;
            }

            return null;
        };

        getCurrentTimeZone = function() {
            return this.currenTimezone;
        };

        setCurrentTimeZone = function(timezone) {
            if(timezone !== null) {
                this.currenTimezone = timezone;
            }
            else {
                this.currenTimezone = this.defaultTimeZone;
            }
        };

        Localization = Model.inherit({
            didInitialize: didInitialize,
            fetch: fetch,
            getCountries: getCountries,
            getVAT: getVAT,
            convertPrice: convertPrice,
            convertPrices: convertPrices,
            getTimeZones: getTimeZones,
            getLocalTimeZone: getLocalTimeZone,
            getCurrentTimeZone: getCurrentTimeZone,
            setCurrentTimeZone: setCurrentTimeZone
        });
        Localization = new Localization.constructor({
            rootURL: Config.API_URL
        });
        Localization.initialize();
        Localization.fetch();

		return Localization;
	}
);
