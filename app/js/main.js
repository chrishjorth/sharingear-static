/**
 * Entry point for the Sharingear app and environment configuration.
 * @author: Chris Hjorth
 */

requirejs.config({
	baseUrl: 'js',
	paths: {
		text: 'libraries/text',
		underscore: 'libraries/underscore-min',
		jquery: 'libraries/jquery-2.1.1.min'
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
	['underscore', 'app'],
	function(_, App) {
		//Configure underscore templates to use Handlebars style
		_.templateSettings = {
			evaluate: /\{\{=(.+?)\}\}/g,
			interpolate: /\{\{(.+?)\}\}/g,
			escape: /\{\{-(.+?)\}\}/g
		};

		App.run();
	}
);
