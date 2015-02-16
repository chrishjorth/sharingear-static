/**
 * Entry point for the Sharingear app and environment configuration.
 * @author: Chris Hjorth
 */

'use strict';

requirejs.config({
	baseUrl: 'js',
	paths: {
		text: 'libraries/text',
		async: 'libraries/async',
		underscore: 'libraries/underscore-min',
		jquery: 'libraries/jquery-2.1.1.min',
		bootstrap: 'libraries/bootstrap.min',
		moment: 'libraries/moment.min',
		momenttz: 'libraries/moment-timezone-with-data.min',
		facebook: 'https://connect.facebook.net/en_US/all',
		owlcarousel: 'libraries/owl-carousel/owl.carousel.min',
		//braintree: 'https://assets.braintreegateway.com/v2/braintree',
		mangopay: 'libraries/mangopay-kit'
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
		'mangopay': {
			exports: 'MangoPay'
		},
		'momenttz': {
			deps: ['moment']
		}
	}
});

//Based on http://blog.millermedeiros.com/requirejs-2-0-delayed-module-evaluation-and-google-maps/
// convert Google Maps into an AMD module
//
define('googlemaps', ['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyByhkzhQYoAk2bAGRYIuvHOl1jIP99_iyE&libraries=places'], function(){
    // return the googlemaps namespace for brevity
		
    return window.google.maps;
});

require(
	//We load moment and moment timezones here to make sure all moments are timezone synched
	['underscore', 'bootstrap', 'app', 'moment', 'momenttz'],
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
