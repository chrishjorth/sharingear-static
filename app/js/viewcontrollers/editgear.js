/**
 * Controller for the Sharingear Edit gear page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear', 'googlemaps'],
	function(ViewController, App, Gear, GoogleMaps) {
		var EditGear = ViewController.inherit({
			gear: null,
			geocoder: new GoogleMaps.Geocoder(),

			didInitialize: didInitialize,
			didRender: didRender,
			populateBrandSelect: populateBrandSelect,
			populateSubtypeSelect: populateSubtypeSelect,
            populateLocation: populateLocation,
            populateCountry: populateCountry,
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

            this.populateCountry();
            this.populateLocation();

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

            if(this.gear.data.country === '') {
                $("#editgearpricingloc-form #editgearpricing-country").prop("selectedIndex", 0); // if no country is passed, "Choose country:" by default
            }
            else {
                $("#editgearpricingloc-form #editgearpricing-country", this.$element).val(this.gear.data.country);
            }

			this.setupEvents();
		}

        function populateLocation() {

            var city = this.gear.data.city,
            address = this.gear.data.address,
            postalcode = this.gear.data.postal_code,
            region=this.gear.data.region;

            $("#editgearpricingloc-form #editgearpricing-city").val(city);
            $("#editgearpricingloc-form #editgearpricing-address").val(address);
            $("#editgearpricingloc-form #editgearpricing-postalcode").val(postalcode);
            $("#editgearpricingloc-form #editgearpricing-region").val(region);
        }

        function populateCountry() {
            var currentCountry = this.gear.data.country,
                html = '<option> Choose country: </option>',
                $countrySelect,i;
            var countryList = [
                'Andorra',
                'Australia',
                'Austria',
                'Belgium',
                'Canada',
                'Cyprus',
                'Denmark',
                'Estonia',
                'Finland',
                'France',
                'Germany',
                'Greece',
                'Ireland',
                'Italy',
                'Latvia',
                'Lithuania',
                'Luxembourg',
                'Malta',
                'Monaco',
                'Netherlands',
                'Norway',
                'Poland',
                'Portugal',
                'San Marino',
                'Slovakia',
                'Slovenia',
                'Spain',
                'Sweden',
                'Switzerland',
                'United Kingdom',
                'United States'
            ];

            $countrySelect = $('#editgearpricing-country', this.$element);
            $countrySelect.empty();

            for(i = 0; i < countryList.length; i++) {
                html += '<option value="' + countryList[i] + '">' + countryList[i] + '</option>';
            }
            $countrySelect.append(html);
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
			this.setupEvent('click', '#editgear-form .btn-cancel, #editgear-photos-form .btn-cancel, #editgearpricing-form .btn-cancel, #editgearpricingloc-form .btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '#editgear-form .btn-save, #editgear-photos-form .btn-save, #editgearpricing-form .btn-save, #editgearpricingloc-form .btn-save', this, this.handleNext);
		}

		function handleCancel(event) {
			var view = event.data;

            var currentVerticalPosition = $(window).scrollTop();
            App.router.closeModalView();
            $("body, html").animate({scrollTop: currentVerticalPosition},50);

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
				address: $('#editgearpricingloc-form #editgearpricing-address', this.$element).val(),
				postal_code: $('#editgearpricingloc-form #editgearpricing-postalcode', this.$element).val(),
				city: $('#editgearpricingloc-form #editgearpricing-city', this.$element).val(),
				region: $('#editgearpricingloc-form #editgearpricing-region', this.$element).val(),
				country: $('#editgearpricingloc-form #editgearpricing-country option:selected').val()
            };

			_.extend(view.gear.data, updatedGearData);

			updateCall = function() {
				view.gear.save(App.user.data.id, function(error, gear) {
                    if(error) {
						console.log(error);
						return;
					}
					App.router.closeModalView();
				});
			};

			isLocationSame = (currentAddress === updatedGearData.address &&
				currentPostalCode === updatedGearData.postal_code &&
				currentCity === updatedGearData.city &&
				currentRegion === updatedGearData.region &&
				currentCountry === updatedGearData.country);

			if(isLocationSame === false) {
				addressOneliner = updatedGearData.address + ', ' + updatedGearData.postalcode + ' ' + updatedGearData.city + ', ' + updatedGearData.region + ', ' + updatedGearData.country;
				view.geocoder.geocode({'address': addressOneliner}, function(results, status) {
					if(status === GoogleMaps.GeocoderStatus.OK) {
						view.gear.data.longitude = results[0].geometry.location.lng();
						view.gear.data.latitude = results[0].geometry.location.lat();
						console.log('lat: ' + view.gear.data.latitude);
						console.log('long: ' + view.gear.data.longitude);
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
