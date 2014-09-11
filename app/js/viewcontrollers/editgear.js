/**
 * Controller for the Sharingear Edit gear page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var EditGear = ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleCancel: handleCancel,
			handleNext: handleNext
		}); 
		return EditGear;

		function didInitialize() {
			this.templateParameters = {
				brand: 'Marshall',
				model: 'JCM 900',
				description: 'blah blah'
			};
		}

		function didRender() {
			this.setupEvents();
		}

		function setupEvents() {
			this.setupEvent('click', '#editgear-form .btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '#editgear-form .btn-next', this, this.handleNext);
		}

		function handleCancel(event) {
			App.router.closeModalView();
		}

		function handleNext(event) {
			App.router.openModalView('gearpricing');
		}
	}
);