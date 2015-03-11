/**
 * Defines a currency conversion model.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['model', 'config'],
	function(Model, Config) {
		var currencies = {},
			XChangeRates,

			getRate;

		getRate = function(fromCurrency, toCurrency, callback) {
			var code = fromCurrency + toCurrency;
			if(currencies[code]) {
				callback(null, currencies[code]);
				return;
			}
			this.get('/exchangerates/' + fromCurrency + '/' + toCurrency, function(error, data) {
				if(error) {
					callback(error);
					return;
				}
				currencies[code] = data.rate;
				callback(null, data.rate);
			});
		};

		XChangeRates = Model.inherit({
			getRate: getRate
		});
		XChangeRates = new XChangeRates.constructor({
			rootURL: Config.API_URL
		});
		return XChangeRates;
	}
);