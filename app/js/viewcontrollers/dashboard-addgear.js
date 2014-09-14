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
			//handleImageUpload: handleImageUpload,
			populateSubtypeSelect: populateSubtypeSelect,
			populateBrandSelect: populateBrandSelect,
			prepopulate: prepopulate
		}); 
		return AddGear;

		function didInitialize() {
			this.newGear = new Gear.constructor({
				rootURL: App.API_URL,
				data: {
					images: ''
				}
			});

			if(this.passedData) {
				_.extend(this.newGear, this.passedData);
			}
		}

		function didRender() {
			var view = this;
			this.addGearIcons(function() {
				view.prepopulate();
			});

			this.setupEvent('submit', '#dashboard-addgear-form', this, this.handleNext);
			//this.setupEvent('change', '#dashboard-addgear-form-imageupload', this, this.handleImageUpload);
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
				newData;

			//Create new gear model object from form data

			newData = {
				type: $('#dashboard-addgear-form .gearbuttonlist-container input[type="radio"]:checked').val(),
				subtype: $('#dashboard-addgear-form-subtype option:selected').val(),
				brand: $('#dashboard-addgear-form-brand option:selected').val(),
				model: $('#dashboard-addgear-form-model').val(),
				description: $('#dashboard-addgear-form-description').val()
			};

			_.extend(view.newGear.data, newData);

			App.router.navigateTo('dashboard/addgearprice', view.newGear);
		}

		/*function handleImageUpload(event) {
			var view = event.data
				$file = $(this);
			view.newGear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
				var $thumbList, html;
				if(error) {
					alert('Error uploading file.');
					console.log(error);
					return;
				}
				view.newGear.data.images += url + ',';
				$thumbList = $('#dashboard-addgear-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);
			});
		}*/

		/**
		 * Prefills the form with passed data.
		 */
		function prepopulate() {
			var newGear;
			if(this.passedData === null) {
				return;
			}
			newGear = this.passedData.data;
			if(newGear.type.length >= 0) {
				$('#dashboard-addgear-form .gearbuttonlist-container #gear-radio-' + newGear.type.toLowerCase() + '').prop("checked", true);
				this.populateSubtypeSelect(newGear.type);
				if(newGear.subtype.length >= 0) {
					$('#gear-subtype-container select').val(newGear.subtype);
					this.populateBrandSelect();
					if(newGear.brand.length >= 0) {
						$('#gear-brand-container select').val(newGear.brand);
					}
				}
			}
			$('#dashboard-addgear-form-model').val(newGear.model);
			$('#dashboard-addgear-form-description').val(newGear.description);
		}
	}
);