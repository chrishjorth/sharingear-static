/**
 * Controller for the Sharingear Edit gear page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear'],
	function(ViewController, App, Gear) {
		var EditGear = ViewController.inherit({
			gear: null,

			didInitialize: didInitialize,
			didRender: didRender,
			populateBrandSelect: populateBrandSelect,
			populateSubtypeSelect: populateSubtypeSelect,
			setupEvents: setupEvents,
			handleCancel: handleCancel,
			handleNext: handleNext
		});
		return EditGear;

		function didInitialize() {
			this.gear = this.passedData;
			this.templateParameters = this.gear.data;
		}

		function didRender() {
			this.populateBrandSelect();
			this.populateSubtypeSelect();

			if(this.gear.data.subtype === '') {
				$("#editgear-subtype").prop("selectedIndex", 0); // if no subtype is passed, "Choose type:" by default
			}
			else {
				$('#editgear-subtype', this.$element).val(this.gear.data.subtype);
			}

			if(this.gear.data.brand === '') {
				$("#editgear-brand").prop("selectedIndex", 0); // if no brand is passed, "Choose brand:" by default
			}
			else {
				$('#editgear-brand', this.$element).val(this.gear.data.brand);
			}
			this.setupEvents();
		}

		function populateBrandSelect() {
			var brands = App.gearClassification.data.brands,
				html = '<option> Choose brand: </option>',
				$brandSelect, i;
			if(!brands) {
				brands = [];
			}

			$brandSelect = $('#editgear-brand', this.$element);
			$brandSelect.empty();

			for(i = 0; i < brands.length; i++) {
				html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
			}
			$brandSelect.append(html);
		}

		function populateSubtypeSelect() {
			var gearClassification = App.gearClassification.data.classification,
				html = '<option> Choose subtype: </option>',
				$subtypeSelect,
				$brandSelect,
				gearSubtypes, i;

			$subtypeSelect = $('#editgear-subtype', this.$element);
			$subtypeSelect.empty();

			gearSubtypes = gearClassification[this.gear.data.type];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i] + '">' + gearSubtypes[i] + '</option>';
			}
			$subtypeSelect.append(html);
		}

		function setupEvents() {
			this.setupEvent('click', '#editgear-form .btn-cancel, #editgear-photos-form .btn-cancel, #editgearpricing-form .btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '#editgear-form .btn-save, #editgear-photos-form .btn-save, #editgearpricing-form .btn-save', this, this.handleNext);
		}

		function handleCancel(event) {
			var view = event.data;
			App.router.closeModalView();
		}

		function handleNext(event) {
			var view = event.data,
			updatedGearData,
			isLocationSame = false,
			currentAddress = view.gear.data.address,
			currentPostalCode = view.gear.data.postalcode,
			currentCity = view.gear.data.city,
			currentRegion = view.gear.data.region,
			currentCountry = view.gear.data.country,
			updatedGearData,
			addressOneliner,
			updateCall;

			updatedGearData = {
				brand: $('#editgear-brand option:selected', view.$element).val(),
				subtype: $('#editgear-subtype option:selected', view.$element).val(),
				model: $('#editgear-model', view.$element).val(),
				description: $('#editgear-description', view.$element).val(),

				price_a: $('#editgearpricing-form #price_a', this.$element).val(),
				price_b: $('#editgearpricing-form #price_b', this.$element).val(),
				price_c: $('#editgearpricing-form #price_c', this.$element).val(),
				address: $('#editgearpricing-form #editgearpricing-address', this.$element).val(),
				postal_code: $('#editgearpricing-form #editgearpricing-postalcode', this.$element).val(),
				city: $('#editgearpricing-form #editgearpricing-city', this.$element).val(),
				region: $('#editgearpricing-form #editgearpricing-region', this.$element).val(),
				country: $('#editgearpricing-form #editgearpricing-country option:selected').val()
			};

			_.extend(view.gear.data, updatedGearData);

			view.gear.save(App.user.data.id, function(error, gear) {
				if(error) {
					console.log(error);
					return;
				}
			});

			//App.router.openModalView('editgearphotos', view.gear);
		}
	}
);
