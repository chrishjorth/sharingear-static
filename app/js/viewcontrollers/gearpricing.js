/**
 * Controller for the Sharingear Gear pricing view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var GearPricing = ViewController.inherit({
			didRender: didRender,
			setupEvents: setupEvents,
			handleCancel: handleCancel,
			handleSave: handleSave
		}); 
		return GearPricing;

		function didRender() {
			this.setupEvents();
		}

		function setupEvents() {
			this.setupEvent('click', '#gearpricing-form .btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '#gearpricing-form .btn-save', this, this.handleSave);
		}

		function handleCancel() {
			App.router.closeModalView();
		}

		function handleSave() {
			App.router.closeModalView();
		}
	}
);