/**
 * Controller for the Sharingear footer view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['viewcontroller', 'moment', 'models/localization'],
	function(ViewController, Moment, Localization) {
		var didInitialize;

		didInitialize = function() {
			var today = new Moment.tz(Localization.getCurrentTimeZone());
			
			this.templateParameters = {
				year: today.format('YYYY')
			};
		};

		return ViewController.inherit({
			didInitialize: didInitialize
		});
	}
);