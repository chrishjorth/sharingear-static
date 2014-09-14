/**
 * Controller for the Sharingear Add gear pricing dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gear'],
	function(_, ViewController, App, Gear) {
		var AddGearPrice = ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			handleSave: handleSave,
			handleBreadcrumbBack: handleBreadcrumbBack
		}); 
		return AddGearPrice;

		function didInitialize() {
			this.newGear = new Gear.constructor({
				rootURL: App.API_URL,
				data: {}
			});

			if(this.passedData) {
				_.extend(this.newGear, this.passedData);
			}
		}

		function didRender() {
			var newGear = this.newGear.data;
			$('#dashboard-addgearprice-form #price_a', this.$element).val(newGear.price_a);
			$('#dashboard-addgearprice-form #price_b', this.$element).val(newGear.price_b);
			$('#dashboard-addgearprice-form #price_c', this.$element).val(newGear.price_c);

			this.setupEvent('submit', '#dashboard-addgearprice-form', this, this.handleSave);
			this.setupEvent('click', '.addgearpanel .btnaddgeartwo', this, this.handleBreadcrumbBack);
		}

		function handleSave(event) {
			var view = event.data,
				newGear;
			newGear = view.passedData;
			console.log(newGear);
			newGear.data.price_a = $('#dashboard-addgearprice-form #price_a', view.$element).val();
			newGear.data.price_b = $('#dashboard-addgearprice-form #price_b', view.$element).val();
			newGear.data.price_c = $('#dashboard-addgearprice-form #price_c', view.$element).val();

			newGear.createGear(App.user);
		}

		function handleBreadcrumbBack(event) {
			var view = event.data;

			_.extend(view.newGear.data, {
				price_a: $('#dashboard-addgearprice-form #price_a', view.$element).val(),
				price_b: $('#dashboard-addgearprice-form #price_b', view.$element).val(),
				price_c: $('#dashboard-addgearprice-form #price_c', view.$element).val()
			});

			App.router.navigateTo('dashboard/addgear', view.newGear);
		}
	}
);