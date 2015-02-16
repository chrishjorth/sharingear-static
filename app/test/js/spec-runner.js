/**
 * Entry point for the Sharingear frontend test suite.
 * @author: Chris Hjorth
 */

'use strict';

requirejs.config({
	baseUrl: '../js',
	paths: {
		text: 'libraries/text',
		async: 'libraries/async',
		underscore: 'libraries/underscore-min',
		jquery: 'libraries/jquery-2.1.1.min',
		bootstrap: 'libraries/bootstrap.min',
		moment: 'libraries/moment.min',
		momenttz: 'libraries/moment-timezone-with-data.min',
		mocha: '../test/js/libraries/mocha/mocha',
		chai: '../test/js/libraries/chai',
		sinon: '../test/js/libraries/sinon-1.10.3',
		squire: '../test/js/libraries/squire',
		facebook: '../test/js/mocks/facebook', //We use a mock to avoid having to connect to the Facebook server
		//googlemaps: '../test/js/mocks/googlemaps', //We use a mock to avoid having to connect to the Google Maps server
		
		owlcarousel: 'libraries/owl-carousel/owl.carousel.min'
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
		'facebook': {
			exports: 'FB'
		},
		'googlemaps': {
			exports: 'googlemaps'
		},
		'owlcarousel': {
			deps: ['jquery'],
			exports: 'OwlCarousel'
		},
		'momenttz': {
			deps: ['moment']
		}
	}
});

//Based on http://blog.millermedeiros.com/requirejs-2-0-delayed-module-evaluation-and-google-maps/
// convert Google Maps into an AMD module
define('googlemaps', ['async!https://maps.googleapis.com/maps/api/js?key=AIzaSyByhkzhQYoAk2bAGRYIuvHOl1jIP99_iyE&libraries=places'], function(){
    // return the googlemaps namespace for brevity
    return window.google.maps;
});

require(
	['underscore', 'mocha', 'jquery', 'moment', 'momenttz'],
	function(_, Mocha, $) {
		//Configure underscore templates to use Handlebars style
		_.templateSettings = {
			evaluate: /\{\{=(.+?)\}\}/g,
			interpolate: /\{\{(.+?)\}\}/g,
			escape: /\{\{-(.+?)\}\}/g
		};

		window.mocha.setup('bdd');

		$(document).ready(function() {
			require([
				'../test/js/specs/app.spec',
				'../test/js/specs/config.spec',
				'../test/js/specs/router.spec',
				'../test/js/specs/viewloader.spec',
				'../test/js/specs/viewcontroller.spec',
				'../test/js/specs/model.spec',
				'../test/js/specs/utilities.spec',
				
				//'../test/js/specs/viewcontrollers/error.spec',
				//'../test/js/specs/viewcontrollers/footer.spec',
				//'../test/js/specs/viewcontrollers/home.spec',
				//'../test/js/specs/viewcontrollers/navigation-header.spec',
				//'../test/js/specs/viewcontrollers/dashboard.spec',
				//'../test/js/specs/viewcontrollers/dashboard-profile.spec',
				//'../test/js/specs/viewcontrollers/dashboard-yourgear.spec',
				//'../test/js/specs/viewcontrollers/dashboard-yourreservations.spec',
				//'../test/js/specs/viewcontrollers/dashboard-calendar.spec',
				//'../test/js/specs/viewcontrollers/dashboard-settings.spec',
				//'../test/js/specs/viewcontrollers/gearprofile.spec',
				//'../test/js/specs/viewcontrollers/aboutus.spec',
				//'../test/js/specs/viewcontrollers/contactus.spec',
				//'../test/js/specs/viewcontrollers/insurance.spec',
				//'../test/js/specs/viewcontrollers/privacy.spec',
				//'../test/js/specs/models/gearlist.spec',
				//'../test/js/specs/models/user.spec'
			], function() {
				if(window.mochaPhantomJS) {
					window.mochaPhantomJS.run();
				}
				else { 
					window.mocha.run();
				}
			});
		});
	}
);
