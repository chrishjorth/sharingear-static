/**
 * Popup that requests a time.
 * @author: Chris Hjorth
 */

'use strict';

define([
	'jquery', 'popupcontroller', 'text!popups/selecttime.html'
], function($, PopupController, SelectTimePopupTemplate) {
	var SelectTimePopup,

		didRender,
		getSelectedTime,

		handleHours,
		handleMinutes;


	didRender = function() {
		this.setupEvent('change', '#selecttimepopup-hours', this, this.handleHours);
		this.setupEvent('change', '#selecttimepopup-minutes', this, this.handleMinutes);
	};

	getSelectedTime = function() {
		return {
			hours: parseInt($('#selecttimepopup-hours', this.$element).val(), 10),
			minutes: parseInt($('#selecttimepopup-minutes', this.$element).val(), 10)
		};
	};

	handleHours = function(event) {
		var view = event.data;
		$('#selecttimepopup-hours', view.$element).prop('disabled', true);
		$('#selecttimepopup-minutes', view.$element).prop('disabled', false);
	};

	handleMinutes = function(event) {
		var view = event.data;
		view.hide();
	};

	SelectTimePopup = PopupController.inherit({
		template: SelectTimePopupTemplate,

		didRender: didRender,
		getSelectedTime: getSelectedTime,

		handleHours: handleHours,
		handleMinutes: handleMinutes
	});
	return SelectTimePopup;
});