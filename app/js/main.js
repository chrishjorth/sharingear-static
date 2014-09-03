/**
 * Entry point for the Sharingear app and environment configuration.
 * @author: Chris Hjorth
 */

requirejs.config({
	baseUrl: 'js',
	paths: {
		text: 'libraries/text',
		underscore: 'libraries/underscore-min',
		jquery: 'libraries/jquery-2.1.1.min',
		bootstrap: 'libraries/bootstrap.min',
		facebook: 'https://connect.facebook.net/en_US/all'
	},
	shim: {
		underscore: {
			exports: '_'
		},
		jquery: {
			exports: '$'
		},
		bootstrap: {
			deps: ['jquery']
		},
		'facebook' : {
			exports: 'FB'
		}
	}
});

require(
	['underscore', 'bootstrap', 'app'],
	function(_, bootstrap, App) {
		//Configure underscore templates to use Handlebars style
		_.templateSettings = {
			evaluate: /\{\{=(.+?)\}\}/g,
			interpolate: /\{\{(.+?)\}\}/g,
			escape: /\{\{-(.+?)\}\}/g
		};

		App.run();
	}
);