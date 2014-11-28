/**
 * Controller for the Sharingear Add gear dashboard page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'models/gear'],
	function(_, $, ViewController, App, Gear) {
		var subtypeDefault = 'Choose subtype:',
			brandDefault = 'Choose brand:',
			newGear,

			didInitialize,
			didRender,

			addGearIcons,
			populateSubtypeSelect,
			populateBrandSelect,
			handleGearRadio,
			handleSelectSubtype,
			handleNext,
			prepopulate;

		newGear = null;

		didInitialize = function() {
			if(App.user.data.id === null) {
				this.ready = false;
				App.router.navigateTo('home');
				return;
			}
			newGear = new Gear.constructor({
				rootURL: App.API_URL,
				data: {
					id: null,
					images: ''
				}
			});

			if(this.passedData) {
				_.extend(newGear.data, this.passedData.data);
			}
		};

		didRender = function() {
			var view = this;
			this.addGearIcons(function() {
				view.prepopulate();
			});
			this.setupEvent('submit', '#dashboard-addgear-form', this, this.handleNext);
		};

		addGearIcons = function(callback) {
			var view = this;
			App.gearClassification.getClassification(function(gearClassification) {
				var $gearbuttonlistContainer = $('.gearbuttonlist-container', view.$element),
					html = '',
					gearType;

				for(gearType in gearClassification.classification) {
					html += '<div class="custom-radio">';
					html += '<input type="radio" name="gear-radio" id="gear-radio-' + gearType + '" value="' + gearType + '">';
					html += '<label for="gear-radio-' + gearType + '">';
					html += '<img src="images/addgear/' + gearType.toLowerCase() + '-48x48.png" width="48" height"48" class="custom-radio-image">';
					html += gearType;
					html += '</label>';
					html += '</div>';

				}

				$gearbuttonlistContainer.append(html);
				view.setupEvent('change', '#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]', view, view.handleGearRadio);
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		populateSubtypeSelect = function(gearType) {
			var gearClassification = App.gearClassification.data.classification,
				html = '<option> ' + subtypeDefault + ' </option>',
				$subtypeSelect, $brandSelectContainer, gearSubtypes, i;

			$('#gear-subtype-container', this.$element).removeClass('hidden');

			$subtypeSelect = $('#gear-subtype-container select', this.$element);
			$subtypeSelect.empty();
			
			$brandSelectContainer = $('#gear-brand-container', this.$element);
			if($brandSelectContainer.hasClass('hidden') === false) {
				$brandSelectContainer.addClass('hidden');
			}
			
			gearSubtypes = gearClassification[gearType];
			for(i = 0; i < gearSubtypes.length; i++) {
				html += '<option value="' + gearSubtypes[i] + '">' + gearSubtypes[i] + '</option>';
			}
			$subtypeSelect.append(html);
			this.setupEvent('change', '#gear-subtype-container select', this, this.handleSelectSubtype);
		};

		populateBrandSelect = function() {
			var brands = App.gearClassification.data.brands,
				html = '<option> ' + brandDefault + ' </option>',
				$brandSelect, i;

			$('#gear-brand-container', this.$element).removeClass('hidden');

			$brandSelect = $('#gear-brand-container select', this.$element);
			$brandSelect.empty();

			for(i = 0; i < brands.length; i++) {
				html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
			}
			$brandSelect.append(html);
		};

		/**
		 * @assertion: gearClassification has been loaded
		 */
		handleGearRadio = function(event) {
			var view = event.data;
			view.populateSubtypeSelect($(this).val());
		};

		handleSelectSubtype = function(event) {
			var view = event.data;
			view.populateBrandSelect();
		};

		handleNext = function() {
			var newData, callback;

			//Create new gear model object from form data
			newData = {
				type: $('#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]:checked').val(),
				subtype: $('#dashboard-addgear-form-subtype option:selected').val(),
				brand: $('#dashboard-addgear-form-brand option:selected').val(),
				model: $('#dashboard-addgear-form-model').val(),
				description: $('#dashboard-addgear-form-description').val()
			};

			//Validate
			if(!newData.type || newData.type === '') {
				alert('Please select a type of instrument.');
				return;
			}
			if(newData.subtype === '' || newData.subtype === subtypeDefault) {
				alert('Please select a subtype for your instrument.');
				return;
			}
			if(newData.brand === '' || newData.brand === brandDefault) {
				alert('Please select the instrument\'s brand.');
				return;
			}
			if(newData.model === '') {
				alert('Please type in the model of your instrument.');
				return;
			}

			_.extend(newGear.data, newData);

			callback = function(error) {
				if(error) {
					alert('Error saving gear');
					return;
				}
				App.router.navigateTo('dashboard/addgearphotos', newGear);
			};

			if(newGear.data.id === null) {
				newGear.createGear(App.user, callback);
			}
			else {
				//Case of the user breadcrumbing back
				newGear.save(App.user.data.id, callback);
			}
		};

		/**
		 * Prefills the form with passed data.
		 */
		prepopulate = function() {
			var gear;
			if(this.passedData === null || !(this.passedData)) { // added !(this.passedData) because it was undefined. Horatiu
				return;
			}
			gear = this.passedData.data;
			if(gear.type && gear.type.length >= 0) {
				$('#dashboard-addgear-form .gearbuttonlist-container #gear-radio-' + gear.type.toLowerCase() + '').prop('checked', true);
				this.populateSubtypeSelect(gear.type);
				if(gear.subtype && gear.subtype.length >= 0) {
					$('#gear-subtype-container select').val(gear.subtype);
					this.populateBrandSelect();
					if(gear.brand && gear.brand.length >= 0) {
						$('#gear-brand-container select').val(gear.brand);
					}
				}
			}
			$('#dashboard-addgear-form-model').val(gear.model);
			$('#dashboard-addgear-form-description').val(gear.description);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			addGearIcons: addGearIcons,
			handleGearRadio: handleGearRadio,
			handleSelectSubtype: handleSelectSubtype,
			handleNext: handleNext,
			populateSubtypeSelect: populateSubtypeSelect,
			populateBrandSelect: populateBrandSelect,
			prepopulate: prepopulate
		});
	}
);