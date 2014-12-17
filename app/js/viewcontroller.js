/**
 * General view object with support for jQuery event autounbinding and localization.
 * @author: Chris Hjorth
 */

'use strict';

define([
	'underscore', 'jquery', 'utilities'
], function(_, $, Utilities) {
	var initialize,
		render,
		setSubPath,
		close,
		setupEvent,
		unbindEvents,

		constructor, inherit;

	/**
	 * Allows reinitializing a views data.
	 */
	initialize = function() {
		if(this.didInitialize && typeof this.didInitialize == 'function') {
			this.didInitialize();
		}
	};

	render = function(callback) {
		var template = this.template(this.templateParameters),
			subview = null;

		//Unbind events to avoid double ups on multiple renders
		this.unbindEvents();

		this.$element.html(template);

		if(this.subPath !== '' && this.hasSubviews === true) {
			subview = this.subPath;
		}
		if(callback && typeof callback === 'function') {
			callback();
		}

		if(this.didRender && typeof this.didRender == 'function') {
			this.didRender();
		}
	};

	setSubPath = function() {
		var slashIndex = -1;
		slashIndex = this.path.indexOf('/');
		if(slashIndex >= 0) {
			this.subPath = this.path.substring(slashIndex + 1);
		}
	};

	/*function localize($containerElement) {
		var $localizeElement = this.$element,
			key, $element;
		if($containerElement) {
			$localizeElement = $containerElement;
		}
		for(key in this.labels) {
			if(this.labels.hasOwnProperty(key)) {
				$element = $('#' + key, $localizeElement);
				if($element.is('input')) {
					$element.attr('placeholder', this.labels[key]);
				}
				else {
					$element.html(this.labels[key]);
				}
			}
		}
	}*/

	close = function() {
		this.unbindEvents();
		this.$element.empty();
		if(this.didClose && typeof this.didClose == 'function') {
			this.didClose();
		}
	};

	//A wrapper for jQuery events that allows automatic unbinding on view disposal
	setupEvent = function(eventType, element, data, callback) {
		this.$element.on(eventType, element, data, callback);
		this.userEvents.push({
			eventType: eventType,
			element: element,
			callback: callback
		});
	};

	unbindEvents = function() {
		var i, userEvent;
		for(i = this.userEvents.length - 1; i >= 0; i--) {
			userEvent = this.userEvents[i];
			this.$element.off(userEvent.eventType, userEvent.element, userEvent.callback);
			this.userEvents.pop();
		}
	};

	constructor = function(options) {
		var defaults = {
			name: '',
			$element: $(''),
			template: '', //A template string
			templateParameters: {},
			labels: {},
			path: '', //URL path in the following form mainView/subView fx dashboard/profile
			hasSubviews: true,
			$subViewContainer: $(''),
			subPath: '',
			passedData: null, //stores extra data passed to the view
			ready: true,

			initialize: initialize,
			render: render,
			setSubPath: setSubPath,
			//localize: localize,
			close: close,
			setupEvent: setupEvent,
			unbindEvents: unbindEvents
		};

		_.extend(this, defaults, options);

		this.template = _.template(this.template);
		this.userEvents = [];
		
		this.setSubPath();

		this.initialize();
	};

	inherit = function(inheritOptions) {
		var inherited = {
			constructor: Utilities.inherit(this.constructor, inheritOptions)
		};
		return inherited;
	};

	//This pattern is because of require.js, which calls new on function modules and hence triggers object construction prematurely
	return {
		constructor: constructor,
		inherit: inherit
	};
});
