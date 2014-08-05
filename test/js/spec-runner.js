/**
 * Entry point for the Sharingear frontend test suite.
 * @author: Chris Hjorth
 */

requirejs.config({
	baseUrl: '../js',
	paths: {
		text: 'libraries/text',
		underscore: 'libraries/underscore-min',
		jquery: 'libraries/jquery-2.1.1.min',
		mocha: '../test/js/libraries/mocha/mocha',
		chai: '../test/js/libraries/chai'
	},
	shim: {
		underscore: {
			exports: '_'
		},
		jquery: {
			exports: '$'
		}
	}
});

require(
	['underscore', 'mocha', 'jquery'],
	function(_, Mocha, $) {
		//Configure underscore templates to use Handlebars style
		_.templateSettings = {
			evaluate: /\{\{=(.+?)\}\}/g,
			interpolate: /\{\{(.+?)\}\}/g,
			escape: /\{\{-(.+?)\}\}/g
		};

		mocha.setup('bdd');

		$(document).ready(function() {
			require(['../test/js/specs/app.spec'], function() {
				mocha.run();
			});
		});
	}
);
