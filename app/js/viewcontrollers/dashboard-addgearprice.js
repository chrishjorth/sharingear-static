/**
 * Controller for the Sharingear Add gear pricing dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller'],
	function(_, ViewController) {
		var AddGearPrice = ViewController.inherit({
			didRender: didRender,
			handleSave: handleSave
		}); 
		return AddGearPrice;

		function didRender() {
			this.setupEvent('submit', '#dashboard-addgearprice-form', this, this.handleSave);
		}

		function handleSave(event) {
			var view = event.data,
				newGear;
			newGear = view.passedData;
			console.log(newGear);
			newGear.data.price_a = $('#dashboard-addgearprice-form #price_a', view.$element).val();
			newGear.data.price_b = $('#dashboard-addgearprice-form #price_b', view.$element).val();
			newGear.data.price_c = $('#dashboard-addgearprice-form #price_c', view.$element).val();

			console.log(newGear);
		}
	}
);