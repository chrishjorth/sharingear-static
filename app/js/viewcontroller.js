/**
 * General view object with support for jQuery event autounbinding and localization.
 * @author: Chris Hjorth
 */
define([
	'underscore', 'jquery', 'utilities'
], function(_, $, Utilities) {
	var defaults, methods, constructor, inherit;

	defaults = {
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
		ready: true
	};

	methods = {
		render: render,
		setSubPath: setSubPath,
		renderSubviews: renderSubviews,
		loadSubView: loadSubView,
		//localize: localize,
		close: close,
		setupEvent: setupEvent,
		unbindEvents: unbindEvents
	};

	constructor = function(options) {
		_.extend(this, defaults, methods, options);

		this.template = _.template(this.template);
		this.userEvents = [];
		
		this.setSubPath();
		
		if(this.didInitialize && typeof this.didInitialize == 'function') {
			this.didInitialize();
		}
	};

	inherit = function(inheritOptions) {
		var inherited = {
			constructor: Utilities.inherit(this.constructor, inheritOptions)
		};
		return inherited;
	}

	//This pattern is because of require.js, which calls new on function modules and hence triggers object construction prematurely
	return {
		constructor: constructor,
		inherit: inherit
	};

	function render(callback) {
		var template = this.template(this.templateParameters);

		//Unbind events to avoid double ups on multiple renders
		this.unbindEvents();

		this.$element.html(template);
		if(this.didRender && typeof this.didRender == 'function') {
			this.didRender();
		}
		
		if(callback && typeof callback === 'function') {
			callback();
		}
	}

	function setSubPath() {
		var slashIndex = -1;
		slashIndex = this.path.indexOf('/');
		if(slashIndex >= 0) {
			this.subPath = this.path.substring(slashIndex + 1);
		}
	}

	function renderSubviews(data, callback) {
		var view = this;
		if(this.subPath !== '' && this.hasSubviews === true) {
			this.loadSubView(data, function() {
				if(view.didRenderSubview && typeof view.didRenderSubview == 'function') {
					view.didRenderSubview();
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}

	function loadSubView(data, callback) {
		var vc = this;
		require(['viewcontrollers/' + vc.name + '-' + vc.subPath, 'text!../templates/' + vc.name + '-' + vc.subPath + '.html'], function(SubViewController, SubViewTemplate) {
			if(vc.currentSubViewController !== null) {
				vc.currentSubViewController.close();
			}
			vc.currentSubViewController = new SubViewController.constructor({name: vc.subPath, $element: vc.$subViewContainer, labels: {}, template: SubViewTemplate, path: vc.path, passedData: data});
			vc.currentSubViewController.render();
			if(callback && typeof callback === 'function') {
				callback();
			}
		});
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
