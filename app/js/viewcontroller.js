/**
 * General view object with support for jQuery event autounbinding and localization.
 * @author: Chris Hjorth
 */
define([
	'underscore',
	'jquery'
], function(_, $) {
	var defaults = {
		name: '',
		$element: $(''),
		template: '', //A template string
		labels: {},
		path: '' //URL path in the following form mainView/subView fx dashboard/profile
	};

	function ViewController(options) {
		_.extend(this, defaults, options);
		this.template = _.template(this.template);
		this.userEvents = [];
		if(this.didInitialize && typeof this.didInitialize == 'function') {
			this.didInitialize();
		}
	}

	_.extend(ViewController.prototype, {
		render: render,
		//localize: localize,
		close: close,
		setupEvent: setupEvent,
		unbindEvents: unbindEvents
	});

	/*return {
		inherit: inherit
	};*/

	return ViewController;

	/*function inherit(inheritOptions) {
		if(typeof inheritOptions !== 'object') {
			inheritOptions = {};
		}

		var Inherited = function(options) {
			_.extend(inheritOptions, options);
			ViewController.call(this, inheritOptions);
		};

		Inherited.prototype = new ViewController();
		Inherited.prototype.constructor = Inherited;
		return Inherited;
	}*/

	function render() {
		var template = this.template();
		this.$element.html(this.template());
		if(this.didRender && typeof this.didRender == 'function') {
			this.didRender();
		}
	}

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

	function close() {
		this.unbindEvents();
		this.$element.empty();
		if(this.didClose && typeof this.didClose == 'function') {
			this.didClose();
		}
	}

	//A wrapper for jQuery events that allows automatic unbinding on view disposal
	function setupEvent(eventType, element, data, callback) {
		this.$element.on(eventType, element, data, callback);
		this.userEvents.push({
			eventType: eventType,
			element: element,
			callback: callback
		});
	}

	function unbindEvents() {
		var i, userEvent;
		for(i = this.userEvents.length - 1; i >= 0; i--) {
			userEvent = this.userEvents[i];
			this.$element.off(userEvent.eventType, userEvent.element, userEvent.callback);
			this.userEvents.pop();
		}
	}
});
