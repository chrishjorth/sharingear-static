/**
 * Controller for the Sharingear footer view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['viewcontroller', 'moment'],
	function(ViewController, Moment) {
		var didInitialize;

		didInitialize = function() {
			var today = new Moment();
			
			this.templateParameters = {
				year: today.format('YYYY')
			};
		};

		return ViewController.inherit({
			didInitialize: didInitialize
		});
	}
);