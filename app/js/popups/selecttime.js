/**
 * Popup that requests a time.
 * @author: Chris Hjorth
 */

'use strict';

define([
	'jquery', 'popupcontroller', 'text!popups/selecttime.html'
], function($, PopupController, SelectTimePopupTemplate) {
	var SelectTimePopup,

		wasClosed,
		didRender,
		getSelectedTime,
		getWasClosed,

		handleCancel,
		handleConfirm;

	didRender = function() {
		wasClosed = false;
		this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
		this.setupEvent('click', '.confirm-btn', this, this.handleConfirm);
	};

	getSelectedTime = function() {
		return {
			hours: parseInt($('#selecttimepopup-hours', this.$element).val(), 10),
			minutes: parseInt($('#selecttimepopup-minutes', this.$element).val(), 10)
		};
	};
	
	getWasClosed = function(){
		return wasClosed;
	};

	handleConfirm = function(event) {
		var view = event.data;
		wasClosed = false;
		view.hide();
	};

	handleCancel = function(event) {
		var view = event.data;
		wasClosed = true;
		$('#selecttimepopup-hours', this.$element).val("12");
		$('#selecttimepopup-minutes', this.$element).val("00");
		view.hide();
	};

	SelectTimePopup = PopupController.inherit({
		template: SelectTimePopupTemplate,

		didRender: didRender,
		getSelectedTime: getSelectedTime,
		getWasClosed: getWasClosed,
		handleConfirm: handleConfirm,
		handleCancel: handleCancel
	});


	return SelectTimePopup;
});