/**
 * Controller for the Sharingear Add gear dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gear'],
	function(_, ViewController, App, Gear) {
		var AddGear = ViewController.inherit({
			newGear: null,

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
		return AddGear;

		function didInitialize() {
			this.newGear = new Gear.constructor({
				rootURL: App.API_URL,
				data: {
					id: null,
					images: ''
				}
			});

			if(this.passedData) {
				_.extend(this.newGear.data, this.passedData.data);
			}
		}

		function didRender() {
			var view = this;
			this.addGearIcons(function() {
				view.prepopulate();
			});

			this.setupEvent('submit', '#dashboard-addgear-form', this, this.handleNext);
		}

		function addGearIcons(callback) {
			var view = this;
			App.gearClassification.getClassification(function(gearClassification) {
				var $gearbuttonlistContainer = $('.gearbuttonlist-container', this.$element),
					html = '',
					gearType;
				for(gearType in gearClassification.classification) {
					html += '<div class="custom-radio"><input type="radio" class="test" name="gear-radio" id="gear-radio-' + gearType + '" value="' + gearType + '"><label for="gear-radio-' + gearType + '"><img src="images/addgear/addgear_' + gearType.toLowerCase() + '.png"></label></div>';
				}
				$gearbuttonlistContainer.append(html);
				view.setupEvent('change', '#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]', view, view.handleGearRadio);
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function populateSubtypeSelect(gearType) {
			var gearClassification = App.gearClassification.data.classification,
				html = '<option> Choose type: </option>',
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
		}

		function populateBrandSelect() {
			var brands = App.gearClassification.data.brands,
				html = '<option> Choose brand: </option>',
				$brandSelect, i;

			$('#gear-brand-container', this.$element).removeClass('hidden');

			$brandSelect = $('#gear-brand-container select', this.$element);
			$brandSelect.empty();

			for(i = 0; i < brands.length; i++) {
				html += '<option value="' + brands[i] + '">' + brands[i] + '</option>';
			}
			$brandSelect.append(html);
		}

		/**
		 * @assertion: gearClassification has been loaded
		 */
		function handleGearRadio(event) {
			var view = event.data;
			view.populateSubtypeSelect($(this).val());
		}

		function handleSelectSubtype(event) {
			var view = event.data;
			view.populateBrandSelect();
		}

		function handleNext(event) {
			var view = event.data,
				newData, callback;

			//Create new gear model object from form data
			newData = {
				type: $('#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]:checked').val(),
				subtype: $('#dashboard-addgear-form-subtype option:selected').val(),
				brand: $('#dashboard-addgear-form-brand option:selected').val(),
				model: $('#dashboard-addgear-form-model').val(),
				description: $('#dashboard-addgear-form-description').val()
			};

			_.extend(view.newGear.data, newData);

			callback = function(error, data) {
				if(error) {
					alert('Error saving gear');
					return;
				}
				App.router.navigateTo('dashboard/addgearphotos', view.newGear);
			}

			if(view.newGear.data.id === null) {
				view.newGear.createGear(App.user, callback);
			}
			else {
				//Case of the user breadcrumbing back
				view.newGear.save(App.user.data.id, callback);
			}
		}

		/**
		 * Prefills the form with passed data.
		 */
		function prepopulate() {
			var newGear;
			if(this.passedData === null) {
				return;
			}
			newGear = this.passedData.data;
			if(newGear.type && newGear.type.length >= 0) {
				$('#dashboard-addgear-form .gearbuttonlist-container #gear-radio-' + newGear.type.toLowerCase() + '').prop("checked", true);
				this.populateSubtypeSelect(newGear.type);
				if(newGear.subtype && newGear.subtype.length >= 0) {
					$('#gear-subtype-container select').val(newGear.subtype);
					this.populateBrandSelect();
					if(newGear.brand && newGear.brand.length >= 0) {
						$('#gear-brand-container select').val(newGear.brand);
					}
				}
			}
			$('#dashboard-addgear-form-model').val(newGear.model);
			$('#dashboard-addgear-form-description').val(newGear.description);
		}
	}
);