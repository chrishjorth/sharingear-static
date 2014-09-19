/**
 * Controller for the Sharingear Add gear end dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app'],
	function(_, ViewController, App) {
		var AddGearEnd = ViewController.inherit({
			didInitialize: didInitialize
		}); 
		return AddGearEnd;

		function didInitialize() {
			if(this.passedData === null) {
				this.ready = false; //We abort loading the view
				App.router.navigateTo('dashboard/addgear');
				return;
			}
			this.templateParameters = {
				gear_id: this.passedData.data.id
			};
		}
	}
);