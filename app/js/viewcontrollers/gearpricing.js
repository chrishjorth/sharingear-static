/**
 * Controller for the Sharingear Gear pricing view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gear'],
	function(_, ViewController, App, Gear) {
		var GearPricing = ViewController.inherit({
			gear: null,

			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleBack: handleBack,
			handleSave: handleSave
		}); 
		return GearPricing;

		function didInitialize() {
			this.gear = this.passedData;
			this.templateParameters = this.gear.data;
		}

		function didRender() {
			this.setupEvents();
		}

		function setupEvents() {
			this.setupEvent('click', '#gearpricing-form .btn-cancel', this, this.handleBack);
			this.setupEvent('click', '#gearpricing-form .btn-save', this, this.handleSave);
		}

		function handleBack(event) {
			var view = event.data,
				updatedGearData;

			updatedGearData = {
				price_a: $('#gearpricing-form #price_a', view.$element).val(),
				price_b: $('#gearpricing-form #price_b', view.$element).val(),
				price_c: $('#gearpricing-form #price_c', view.$element).val()
			};

			_.extend(view.gear.data, updatedGearData);

			App.router.openModalView('editgear', view.gear.data);
		}

		function handleSave(event) {
			var view = event.data,
				updatedGearData;

			updatedGearData = {
				price_a: $('#gearpricing-form #price_a', view.$element).val(),
				price_b: $('#gearpricing-form #price_b', view.$element).val(),
				price_c: $('#gearpricing-form #price_c', view.$element).val()
			};

			_.extend(view.gear.data, updatedGearData);

			view.gear.save(App.user.data.id, function(error, gear) {
				if(error) {
					console.log(error);
					return;
				}
			});

			App.router.closeModalView();
		}
	}
);