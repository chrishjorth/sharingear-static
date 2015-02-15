/**
 * Controller for the Sharingear Settings page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/localization'],
	function($, ViewController, App, Localization) {
		var didRender;

		didRender = function() {
			var timezones = Localization.getTimeZones(),
				$timezonesSelect = $('#dashboard-settings-timezone', this.$element),
				html = '',
				i, defaultTimezone;

			for(i = 0; i < timezones.length; i ++) {
				html += '<option value="' + timezones[i].name + '">' + timezones[i].name + ' (' + (timezones[i].UTCOffset > 0 ? '+' : '') + timezones[i].UTCOffset + ' UTC)</option>';
			}
			$timezonesSelect.html(html);

			
			defaultTimezone = App.user.data.time_zone;
			
			console.log(defaultTimezone);
			$timezonesSelect.val(defaultTimezone);
		};
		
		return ViewController.inherit({
			didRender: didRender
		});
	}
);