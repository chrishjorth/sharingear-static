/**
 * Controller for the Sharingear submerchant registration page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'moment', 'googlemaps'],
	function($, ViewController, App, Moment, GoogleMaps) {
		var geocoder,

			didRender,
			populateCountries,
			handleCancel,
			handleSubmit,
			handleAccept;

		geocoder = new GoogleMaps.Geocoder();

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
				addressOneliner, $select, content;
			if(user.birthdate === null) {
				user.birthdate = (new Moment($('#submerchantregistration-birthdate', view.$element).val(), 'DD/MM/YYYY')).format('YYYY-MM-DD');	
			}
			if(user.address === null) {
				user.address = $('#submerchantregistration-address', view.$element).val();
			}
			if(user.postal_code === null) {
				user.postal_code = $('#submerchantregistration-postalcode', view.$element).val();
			}
			if(user.city === null) {
				user.city = $('#submerchantregistration-city', view.$element).val();
			}
			if(user.region === null) {
				user.region = $('#submerchantregistration-region', view.$element).val();
			}
			if(user.country === null) {
				$select = $('#submerchantregistration-country', view.$element);
				content = $select.val();
				if(content !== $('option', $select).first().html()) {
					user.country = content;
				}
				else {
                	alert('Please select a country.');
                	return;
            	}
			}
			if(user.nationality === null) {
				$select = $('#submerchantregistration-nationality', view.$element);
				content = $select.val();
				if(content !== $('option', $select).first().html()) {
					user.nationality = content;
				}
				else {
                	alert('Please select a nationality.');
                	return;
            	}
			}
			if(user.phone === null) {
				user.phone = $('#submerchantregistration-phone', view.$element).val();
			}
			
			user.iban = $('#submerchantregistration-iban', view.$element).val();	
			user.swift = $('#submerchantregistration-swift', view.$element).val();

			//Validate
			if (user.birthdate === '') {
                alert('The birthday field is required.');
                return;
            }
            if (user.phone === '') {
                alert('The phone field is required.');
                return;
            }
            if (user.iban === '') {
                alert('The iban field is required.');
                return;
            }
            if (user.swift === '') {
                alert('The swift code field is required.');
                return;
            }

            addressOneliner = user.address + ', ' + user.postal_code + ' ' + user.city + ', ' + user.region + ', ' + user.country;
            geocoder.geocode({'address': addressOneliner}, function(results, status) {
                if(status === GoogleMaps.GeocoderStatus.OK) {
                    $('#submerchantregistration-formcontainer', view.$element).addClass('hidden');
					$('#submerchantregistration-termscontainer', view.$element).removeClass('hidden');
                }
                else {
                    alert('The address is not valid!');
                }
            });
		};

		handleAccept = function(event) {
			var view = event.data,
                currentBtn = $(this);

            currentBtn.html('<i class="fa fa-circle-o-notch fa-fw fa-spin"></i>');
			App.user.update(function(error) {
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