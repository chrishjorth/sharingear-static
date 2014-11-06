/**
 * Controller for the Sharingear Gear pricing view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gear', 'googlemaps'],
	function(_, ViewController, App, Gear, GoogleMaps) {
		var GearPricing = ViewController.inherit({
			gear: null,
			geocoder: new GoogleMaps.Geocoder(),

			didInitialize: didInitialize,
			didRender: didRender,
			setupEvents: setupEvents,
			handleBack: handleBack,
			handleSave: handleSave,
			updateGear: updateGear
		}); 
		return GearPricing;

		function didInitialize() {
			this.gear = this.passedData;
			this.templateParameters = this.gear.data;
		}

		function didRender() {
			var gearData = this.gear.data;
			$('#editgearpricing-form #price_a', this.$element).val(gearData.price_a);
			$('#editgearpricing-form #price_b', this.$element).val(gearData.price_b);
			$('#editgearpricing-form #price_c', this.$element).val(gearData.price_c);
			$('#editgearpricing-form #editgearpricing-address', this.$element).val(gearData.address);
			$('#editgearpricing-form #editgearpricing-postalcode', this.$element).val(gearData.postal_code);
			$('#editgearpricing-form #editgearpricing-city', this.$element).val(gearData.city);
			$('#editgearpricing-form #editgearpricing-region', this.$element).val(gearData.region);
			$('#editgearpricing-form #editgearpricing-country').val(gearData.country);

			this.setupEvents();
		}

		function setupEvents() {
			this.setupEvent('click', '#editgearpricing-form .btn-cancel', this, this.handleBack);
			this.setupEvent('click', '#editgearpricing-form .btn-save', this, this.handleSave);
		}

		function handleBack(event) {
			var view = event.data;

			view.updateGear();

			App.router.openModalView('editgearphotos', view.gear);
		}

		function handleSave(event) {
			var view = event.data;

			view.updateGear();

			App.router.closeModalView();
		}

		function updateGear() {
			var view = this,
				isLocationSame = false,
				currentAddress = this.gear.address,
				currentPostalCode = this.gear.postalcode,
				currentCity = this.gear.city,
				currentRegion = this.gear.region,
				currentCountry = this.gear.country,
				updatedGearData,
				addressOneliner,
				updateCall;

			updatedGearData = {
				price_a: $('#editgearpricing-form #price_a', this.$element).val(),
				price_b: $('#editgearpricing-form #price_b', this.$element).val(),
				price_c: $('#editgearpricing-form #price_c', this.$element).val(),
				address: $('#editgearpricing-form #editgearpricing-address', this.$element).val(),
				postal_code: $('#editgearpricing-form #editgearpricing-postalcode', this.$element).val(),
				city: $('#editgearpricing-form #editgearpricing-city', this.$element).val(),
				region: $('#editgearpricing-form #editgearpricing-region', this.$element).val(),
				country: $('#editgearpricing-form #editgearpricing-country option:selected').val()
			};

			_.extend(this.gear.data, updatedGearData);

			updateCall = function() {
				view.gear.save(App.user.data.id, function(error, gear) {
                    if(error) {
						console.log(error);
						return;
					}
				});
			};

			isLocationSame = (currentAddress === updatedGearData.address &&
				currentPostalCode === updatedGearData.postal_code &&
				currentCity === updatedGearData.city &&
				currentRegion === updatedGearData.region &&
				currentCountry === updatedGearData.country);

			if(isLocationSame === false) {
				addressOneliner = updatedGearData.address + ', ' + updatedGearData.postalcode + ' ' + updatedGearData.city + ', ' + updatedGearData.region + ', ' + updatedGearData.country;
				this.geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.gear.data.longitude = results[0].geometry.location.lng();
						view.gear.data.latitude = results[0].geometry.location.lat();
						updateCall();
					}
					else {
						console.log('Error geocoding: ' + status);
					}
				});
			}
			else {
				updateCall();
			}
		}
	}
);