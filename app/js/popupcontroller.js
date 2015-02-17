/**
 * General popup object that inherits from ViewController.
 * @author: Chris Hjorth
 */

'use strict';

define([
	'underscore', 'jquery', 'viewcontroller', 'utilities'
], function(_, $, ViewController, Utilities) {
	var $popupLightbox = $('#popup-lightbox'),
		inherit, show, hide, setTitle;

	show = function() {
		$popupLightbox.removeClass('hidden');
		this.templateParameters.title = this.title;
		this.render();
	};

	hide = function() {
		$popupLightbox.addClass('hidden');
		this.close();
	};

	setTitle = function(title) {
		this.title = title;
	};

	inherit = function(inheritOptions) {
		var options = {
			$element: $('.popup-container', $popupLightbox),
			title: 'Popup',

			show: show,
			hide: hide,
			setTitle: setTitle
		};
		_.extend(options, inheritOptions);
		
		return {
			constructor: Utilities.inherit(ViewController.constructor, options)
		};
	};

	return {
		inherit: inherit
	};

});