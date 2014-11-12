/**
 * Controller for the Sharingear submerchant registration page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'moment', 'googlemaps'],
	function($, ViewController, App, Moment, GoogleMaps) {
		var didRender,
			populateCountries,
			handleCancel,
			handleSubmit,
			handleAccept;

		didRender = function() {
			var user = App.user.data;
			if(user.birthdate && user.birthdate !== '') {
				$('#submerchantregistration-birthdate', this.$element).parent().addClass('hidden');
			}
			if(user.address && user.address !== '') {
				$('#submerchantregistration-address', this.$element).parent().addClass('hidden');
			}
			if(user.postal_code && user.postal_code !== '') {
				$('#submerchantregistration-postalcode', this.$element).parent().addClass('hidden');
			}
			if(user.city && user.city !== '') {
				$('#submerchantregistration-city', this.$element).parent().addClass('hidden');
			}
			if(user.region && user.region !== '') {
				$('#submerchantregistration-region', this.$element).parent().addClass('hidden');
			}
			if(user.country && user.country !== '') {
				$('#submerchantregistration-country', this.$element).parent().addClass('hidden');
			}
			else {
				populateCountries($('#submerchantregistration-country', this.$element));
			}
			if(user.nationality && user.nationality !== '') {
				$('#submerchantregistration-nationality', this.$element).parent().addClass('hidden');
			}
			else {
				populateCountries($('#submerchantregistration-nationality', this.$element));
			}
			if(user.phone && user.phone !== '') {
				$('#submerchantregistration-phone', this.$element).parent().addClass('hidden');
			}

			this.setupEvent('click', '.btn-cancel', this, this.handleCancel);
			this.setupEvent('submit', '#submerchantregistration-form', this, this.handleSubmit);
			this.setupEvent('click', '#submerchantregistration-accept', this, this.handleAccept);
		};

		populateCountries = function($select) {
			var countriesArray = App.localization.getCountries(),
				html = $('option', $select).first()[0].outerHTML,
				i;
			for(i = 0; i < countriesArray.length; i++) {
				html += '<option value="' + countriesArray[i].alpha2 + '">' + countriesArray[i].name + '</option>';
			}
			$select.html(html);
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handleSubmit = function(event) {
			var view = event.data,
				user = App.user.data,
				$select, content;
			user.birthdate = (new Moment($('#submerchantregistration-birthdate', view.$element).val(), 'DD/MM/YYYY')).format('YYYY-MM-DD');
			user.address = $('#submerchantregistration-address', view.$element).val();
			user.postal_code = $('#submerchantregistration-postalcode', view.$element).val();
			user.city = $('#submerchantregistration-city', view.$element).val();
			user.region = $('#submerchantregistration-region', view.$element).val();


            var addressOneliner = user.address + ', ' + user.postalcode + ' ' + user.city + ', ' + user.region + ', ' + user.country;
            view.geocoder.geocode({'address': addressOneliner}, function(results, status) {
                if(status === GoogleMaps.GeocoderStatus.OK) {
                    view.gear.data.longitude = results[0].geometry.location.lng();
                    view.gear.data.latitude = results[0].geometry.location.lat();
                }
                else {
                    alert('The address is not valid!');
                }
            });


            if (!$('#submerchantregistration-birthdate', view.$element).parent().hasClass('hidden')&&$('#submerchantregistration-birthdate', view.$element).val() === '') {
                alert("The birthday field is required.");
                return;
            }

			$select = $('#submerchantregistration-country', view.$element);
			content = $select.val();
			if(content !== $('option', $select).first().html()) {
				user.country = content;
			}else{
                alert("Please select a country.");
                return;
            }
			
			$select = $('#submerchantregistration-nationality', view.$element);
			content = $select.val();
			if(content !== $('option', $select).first().html()) {
				user.nationality = content;
			}else{
                alert("Please select a nationality.");
                return;
            }
			
			user.phone = $('#submerchantregistration-phone', view.$element).val();
			user.iban = $('#submerchantregistration-iban', view.$element).val();
			user.swift = $('#submerchantregistration-swift', view.$element).val();

            if (!$('#submerchantregistration-phone', view.$element).parent().hasClass('hidden')&&user.phone === '') {
                alert('The phone field is required.');
                return;
            }

            if (!$('#submerchantregistration-iban', view.$element).parent().hasClass('hidden')&&user.iban === '') {
                alert('The iban field is required.');
                return;
            }

            if (!$('#submerchantregistration-swift', view.$element).parent().hasClass('hidden')&&user.swift === '') {
                alert('The swift code field is required.');
                return;
            }



			$('#submerchantregistration-formcontainer', view.$element).addClass('hidden');
			$('#submerchantregistration-termscontainer', view.$element).removeClass('hidden');

		};



		handleAccept = function(event) {
			var view = event.data,
                currentBtn = $(this);
console.log(this);
            currentBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin"></i>');
            console.log(currentBtn);
			App.user.update(function(error) {
                currentBtn.text('Accept');
				if(error) {
					console.log(error);
					alert('Error saving data.');
					return;
				}
				App.user.updateBankDetails(function(error) {
					if(error) {
						console.log(error);
						alert('Error saving data.');
						return;
					}
					App.router.openModalView('gearavailability', view.passedData);
					App.user.fetch(function(error) {
						if(error) {
							console.log('Error fetching user: ' + error);
						}
					});
				});
			});
		};

		return ViewController.inherit({
			didRender: didRender,

			handleCancel: handleCancel,
			handleSubmit: handleSubmit,
			handleAccept: handleAccept
		});
	}
);