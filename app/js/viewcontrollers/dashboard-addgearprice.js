/**
 * Controller for the Sharingear Add gear pricing dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gear', 'googlemaps'],
	function(_, ViewController, App, Gear, GoogleMaps) {
		var AddGearPrice = ViewController.inherit({
			newGear: null,
			geocoder: new GoogleMaps.Geocoder(),
			
			didInitialize: didInitialize,
			didRender: didRender,
			handleSave: handleSave,
			handleBreadcrumbBack: handleBreadcrumbBack,
			save: save
		}); 
		return AddGearPrice;

		function didInitialize() {
			this.newGear = new Gear.constructor({
				rootURL: App.API_URL,
				data: {
					price_a: 0,
					price_b: 0,
					price_c: 0,
					address: '',
					postalcode: null,
					city: '',
					region: '',
					country: '',
					latitude: null,
					longitude: null
				}
			});

			if(this.passedData) {
				_.extend(this.newGear.data, this.passedData.data);
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
			var view = event.data;
			view.save();
		}

		function handleBreadcrumbBack(event) {
			var view = event.data;

			view.save(function(error) {
				if(!error) {
					App.router.navigateTo('dashboard/addgearphotos', view.newGear);
				}
			})
		}

		function save(callback) {
			var view = this,
				currentAddress = this.newGear.address,
				currentPostalCode = this.newGear.postalcode,
				currentCity = this.newGear.city,
				currentRegion = this.newGear.region,
				currentCountry = this.newGear.country,
				didLocationChange = false,
				addressOneliner, newGearData, longitude, latitude, saveCall;

			_.extend(this.newGear.data, {
				price_a: $('#dashboard-addgearprice-form #price_a', this.$element).val(),
				price_b: $('#dashboard-addgearprice-form #price_b', this.$element).val(),
				price_c: $('#dashboard-addgearprice-form #price_c', this.$element).val(),
				address: $('#dashboard-addgearprice-form #dashboard-addgearprice-address', this.$element).val(),
				postalcode: $('#dashboard-addgearprice-form #dashboard-addgearprice-postalcode', this.$element).val(),
				city: $('#dashboard-addgearprice-form #dashboard-addgearprice-city', this.$element).val(),
				region: $('#dashboard-addgearprice-form #dashboard-addgearprice-region', this.$element).val(),
				country: $('#dashboard-addgearprice-form #dashboard-addgearprice-country option:selected').val()
			});

			newGearData = this.newGear.data;

			isLocationSame = (currentAddress === newGearData.address &&
				currentPostalCode === newGearData.postalcode &&
				currentCity === newGearData.city &&
				currentRegion === newGearData.region &&
				currentCountry === newGearData.country);

			saveCall = function() {
				view.newGear.save(App.user.data.id, function(error) {
					if(error) {
						alert('Error saving data');
						callback(error);
						return;
					}
					if(callback && typeof callback === 'function') {
						callback(null);
					}
				});
			};

			if(isLocationSame === false) {
				addressOneliner = newGearData.address + ', ' + newGearData.postalcode + ' ' + newGearData.city + ', ' + newGearData.region + ', ' + newGearData.country;
				this.geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.newGear.data.longitude = results[0].geometry.location.lng();
						view.newGear.data.latitude = results[0].geometry.location.lat();
						saveCall();
					}
					else {
						console.log('Error geocoding: ' + status);
					}
				});
			}
			else {
				saveCall();
			}
		}
	}
);