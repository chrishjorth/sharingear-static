/**
 * Defines a currency conversion model based on exchange rates from Yahoo.
 * YML query builder: https://developer.yahoo.com/yql/console/?q=show%20tables&env=store://datatables.org/alltableswithkeys#h=select+*+from+yahoo.finance.xchange+where+pair+in+(%22EURUSD%22)
 * Example REST call: https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22EURUSD%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=
 * @author: Chris Hjorth
 */

'use strict';

define(
	['model'],
	function(Model) {
		var yahooAPI = 'https://query.yahooapis.com/v1/public/yql?q=',
			currencies = {},
			XChangeRates,

			getRate;

		getRate = function(fromCurrency, toCurrency, callback) {
			var key, query, code;
			code = fromCurrency + toCurrency;
			for(key in currencies) {
				if(key === code) {
					callback(null, currencies[key]);
					return;
				}
			}
			query = 'select * from yahoo.finance.xchange where pair in ("';
			query += code;
			query += '")&format=json&env=store://datatables.org/alltableswithkeys&callback=';
			this.get(query, function(error, data) {
				var rate;
				if(error) {
					callback('Error retrieving exchange rate: ' + error);
					return;
				}
				rate = parseFloat(data.query.results.rate.Rate);
				currencies[code] = rate;
				callback(null, rate);
			});
		};

		XChangeRates = Model.inherit({
			getRate: getRate
		});
		XChangeRates = new XChangeRates.constructor({
			rootURL: yahooAPI
		});
		return XChangeRates;
	}
);