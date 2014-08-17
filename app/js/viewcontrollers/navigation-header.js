/**
 * Controller for the Sharingear header with navigation view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller'],
	function(_, ViewController) {
		//var Header = ViewController.inherit();
		var Header = ViewController;

		Header.didRender = function() {
			//console.log('did render');
		};

		return Header;

		function render() {
			console.log('Navigation header rendered.');
		}
	}
);