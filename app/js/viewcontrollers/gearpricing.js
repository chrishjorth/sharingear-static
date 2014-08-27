/**
 * Controller for the Sharingear Gear pricing view.
 * @author: Chris Hjorth
 */

define(
	['utilities', 'viewcontroller', 'app'],
	function(Utilities, ViewController, App) {
		var GearPricing = Utilities.inherit(ViewController, {
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
			console.log('CANCEL!');
			App.router.closeModalView();
		}

		function handleSave() {
			App.router.closeModalView();
		}
	}
);