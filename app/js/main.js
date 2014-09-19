/**
 * Entry point for the Sharingear app and environment configuration.
 * @author: Chris Hjorth
 */

requirejs.config({
	baseUrl: 'js',
	paths: {
		text: 'libraries/text',
		async: 'libraries/async',
		underscore: 'libraries/underscore-min',
		jquery: 'libraries/jquery-2.1.1.min',
		bootstrap: 'libraries/bootstrap.min',
		facebook: 'https://connect.facebook.net/en_US/all',
		galleria: 'libraries/galleria-1.4.2.min'
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
		},
		'galleria': {
			deps: ['jquery'],
			exports: 'Galleria'
		}
	}
});

//Based on http://blog.millermedeiros.com/requirejs-2-0-delayed-module-evaluation-and-google-maps/
// convert Google Maps into an AMD module
//
define('googlemaps', ['async!http://maps.googleapis.com/maps/api/js'], function(){
    // return the googlemaps namespace for brevity
    return window.google.maps;
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