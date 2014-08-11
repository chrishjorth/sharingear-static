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
		chai: '../test/js/libraries/chai',
		sinon: '../test/js/libraries/sinon-1.10.3'
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
			require([
				'../test/js/specs/app.spec',
				'../test/js/specs/router.spec',
				'../test/js/specs/viewcontroller.spec',
				'../test/js/specs/viewcontrollers/error.spec',
				'../test/js/specs/viewcontrollers/footer.spec',
				'../test/js/specs/viewcontrollers/home.spec',
				'../test/js/specs/viewcontrollers/navigation-header.spec'
			], function() {
				mocha.run();
			});
		});
	}
);
