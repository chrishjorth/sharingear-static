/**
 * Controller for the Sharingear Edit gear page view.
 * @author: Chris Hjorth, Gediminas Bivainis
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
			populateImages: populateImages,
            populateLocation: populateLocation,
            populateCountry: populateCountry,
            populateDelivery:populateDelivery,
			handleCancel: handleCancel,
			handleImageUpload: handleImageUpload,
            handleDeliveryCheckbox:handleDeliveryCheckbox,
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

			this.populateImages();

            this.populateCountry();
            this.populateLocation();
            this.populateDelivery();

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

			this.setupEvent('click', '#editgear-form .btn-cancel, #editgear-photos-form .btn-cancel, #editgearpricing-form .btn-cancel, #editgearpricingloc-form .btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '#editgear-form .btn-save, #editgear-photos-form .btn-save, #editgearpricing-form .btn-save, #editgearpricingloc-form .btn-save', this, this.handleNext);
			this.setupEvent('change', '#editgear-photos-form-imageupload', this, this.handleImageUpload);
            this.setupEvent('change', '#gear-delivery-available-checkbox', this, this.handleDeliveryCheckbox);
		}

        function populateDelivery(){
            var price = this.gear.data.delivery_price ? this.gear.data.delivery_price : '',
                distance = this.gear.data.delivery_distance ? this.gear.data.delivery_distance : '';

            $("#editgearpricingloc-form #delivery_price").val(price);
            $("#editgearpricingloc-form #delivery_distance").val(distance);
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
            var currentCountry = this.gear.data.country;
            var html = '<option selected="selected">'+currentCountry+'</option>',
                $countrySelect,i;

            var countryList = App.localization.getCountries();

            $countrySelect = $('#editgearpricing-country', this.$element);
            $countrySelect.empty();

            for(i = 0; i < countryList.length; i++) {
                if (currentCountry!==countryList[i].name) {
                    html += '<option value="' + countryList[i].alpha2 + '">' + countryList[i].name + '</option>';
                }
            }
            $countrySelect.html(html);

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

		function populateImages() {
			var images = this.gear.data.images.split(','),
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {
					html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
				}
			}
			$('#editgear-photos-form .thumb-list-container ul', this.$element).append(html);
		}

        function handleDeliveryCheckbox(event){

            this.checked ?
                $(this).closest('#addDeliveryPriceContainer').find('fieldset').removeAttr('disabled')
                : $(this).closest('#addDeliveryPriceContainer').find('fieldset').attr('disabled', true);
        }


		function handleCancel(event) {
			var view = event.data;

            var currentVerticalPosition = $(window).scrollTop();
            App.router.closeModalView();
            $("body, html").animate({scrollTop: currentVerticalPosition},50);

		}

		function handleImageUpload(event) {
			var view = event.data
				$file = $(this);
			view.gear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
				var $thumbList, html;
				$('#editgear-form-imageupload').val('');
				if(error) {
					alert('Error uploading file.');
					console.log(error);
					return;
				}

				console.log("Edit picture URL: " + url);

				$thumbList = $('#editgear-photos-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);
			});
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
			updateCall,
            currentBtn = $(this);

            currentBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

			updatedGearData = {
				brand: $('#editgear-brand option:selected', view.$element).val(),
				subtype: $('#editgear-subtype option:selected', view.$element).val(),
				model: $('#editgear-model', view.$element).val(),
				description: $('#editgear-description', view.$element).val(),
				price_a: $('#editgearpricing-form #price_a', this.$element).val(),
				price_b: $('#editgearpricing-form #price_b', this.$element).val(),
				price_c: $('#editgearpricing-form #price_c', this.$element).val(),
                delivery_price: '',
                delivery_distance: '',
				address: $('#editgearpricingloc-form #editgearpricing-address', this.$element).val(),
				postal_code: $('#editgearpricingloc-form #editgearpricing-postalcode', this.$element).val(),
				city: $('#editgearpricingloc-form #editgearpricing-city', this.$element).val(),
				region: $('#editgearpricingloc-form #editgearpricing-region', this.$element).val(),
				country: $('#editgearpricingloc-form #editgearpricing-country option:selected').val()
            };

			_.extend(view.gear.data, updatedGearData);

			updateCall = function() {
				view.gear.save(App.user.data.id, function(error, gear) {
                    currentBtn.text('Save');
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
