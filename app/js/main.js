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
		moment: 'libraries/moment.min',
		facebook: 'http://connect.facebook.net/en_US/all',
		owlcarousel: 'libraries/owl-carousel/owl.carousel.min',
		daterangepicker: 'libraries/daterangepicker/daterangepicker',
		magnificpopup: 'libraries/magnificpopup/magnificpopup'
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
		'owlcarousel': {
			deps: ['jquery'],
			exports: 'OwlCarousel'
		},
		'daterangepicker': {
			deps: ['jquery', 'bootstrap', 'moment']
		},
		'magnificpopup': {
			deps: ['jquery'],
			exports: 'MagnificPopup'
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