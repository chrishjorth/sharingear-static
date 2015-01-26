/**
 * Defines a localization and locale data.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'model'],
	function(_, Utilities, Model) {
		var Localization,

            alpha2Countries,
            vat,

			getCountries,
            getVAT;

		alpha2Countries = {
    		//'AD': 'andorra',
    		//'AT': 'austria',
    		//'BE': 'belgium',
    		'DK': 'denmark',
    		//'EE': 'estonia',
    		//'FI': 'finland',
    		//'FR': 'france',
    		//'DE': 'germany',
    		//'GR': 'greece',
    		//'IE': 'ireland',
    		//'IT': 'italy',
    		//'LV': 'latvia',
    		//'LU': 'luxembourg',
    		//'MT': 'malta',
    		//'MC': 'monaco',
    		//'NL': 'netherlands',
    		//'NO': 'norway',
    		//'PT': 'portugal',
    		//'SM': 'san marino',
    		//'SK': 'slovakia',
    		//'SI': 'slovenia',
    		//'ES': 'spain',
    		//'SE': 'sweden',
    		//'GB': 'united kingdom'
		};

        vat = {
            'DK': 25.0
        };

		getCountries = function() {
			var countriesArray = [],
				key;
			for(key in alpha2Countries) {
				countriesArray.push({
					alpha2: key,
					name: Utilities.capitalizeString(alpha2Countries[key])
				});
			}
			return countriesArray;
		};

        getVAT = function(countryCode) {
            return vat[countryCode];
        };

        Localization = Model.inherit({
            getCountries: getCountries,
            getVAT: getVAT
        });

		return new Localization.constructor();
	}
);
