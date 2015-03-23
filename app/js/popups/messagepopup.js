/**
 * Popup that requests a time.
 * @author: Chris Hjorth
 */

'use strict';

define([
	'jquery', 'popupcontroller', 'text!popups/messagepopup.html'
], function($, PopupController, MessagePopupTemplate) {
	var MessagePopup,

		setMessage,
		wasClosed,
		didRender,
		getWasClosed,

		handleCancel;

	didRender = function() {
		wasClosed = false;
		this.setupEvent('click', '.cancel-btn', this, this.handleCancel);
	};

	setMessage = function(message){
		$('#popup-message', this.$element).html(message);
	};
	
	getWasClosed = function(){
		return wasClosed;
	};

	handleCancel = function(event) {
		var view = event.data;
		wasClosed = true;
		view.hide();
	};

	MessagePopup = PopupController.inherit({
		template: MessagePopupTemplate,

		didRender: didRender,
		setMessage:setMessage,
		
		getWasClosed: getWasClosed,
		handleCancel: handleCancel
	});


	return MessagePopup;
});