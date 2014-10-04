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
			populateImages: populateImages,
			setupEvents: setupEvents,
			handleCancel: handleCancel,
			handleNext: handleNext,
			handleImageUpload: handleImageUpload
		}); 
		return EditGear;

		function didInitialize() {
			this.templateParameters = this.passedData;
			this.gear = new Gear.constructor({
				rootURL: App.API_URL,
				data: this.passedData
			});
		}

		function didRender() {
			this.populateBrandSelect();
			
			if (this.passedData.brand == '') {
				$("#editgear-brand").prop("selectedIndex", 0); // if no brand is passed, "Choose brand:" by default
			} else {
				$('#editgear-brand', this.$element).val(this.passedData.brand);
			}

			this.populateSubtypeSelect(this.passedData.type);
			if (this.passedData.subtype == '') {
				$("#editgear-subtype").prop("selectedIndex", 0); // if no subtype is passed, "Choose type:" by default
			} else {
				$('#editgear-subtype', this.$element).val(this.passedData.subtype);
			}
			this.populateImages();
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

		function populateSubtypeSelect(gearType) {
			var gearClassification = App.gearClassification.data.classification,
				html = '<option> Choose type: </option>',
				$subtypeSelect, 
				$brandSelect, 
				gearSubtypes, i;

			$subtypeSelect = $('#editgear-subtype', this.$element);
			$subtypeSelect.empty();
			
			gearSubtypes = gearClassification[gearType];
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
			$('#editgear-form .thumb-list-container ul', this.$element).append(html);
		}

		function setupEvents() {
			this.setupEvent('click', '#editgear-form .btn-cancel', this, this.handleCancel);
			this.setupEvent('click', '#editgear-form .btn-next', this, this.handleNext);
			this.setupEvent('change', '#editgear-form-imageupload', this, this.handleImageUpload);
		}

		function handleCancel(event) {
			App.router.closeModalView();
		}

		function handleNext(event) {
			var view = event.data,
			updatedGearData;

			updatedGearData = {
				brand: $('#editgear-brand option:selected', view.$element).val(),
				subtype: $('#editgear-subtype option:selected', view.$element).val(),
				model: $('#editgear-model', view.$element).val(),
				description: $('#editgear-description', view.$element).val()
			};

			if ($('#editgear-brand option:selected', view.$element).val() == "Choose brand:") {			// Check for empty values, don't proceed if true
				alert("Choose a brand, bro");
			} else if ($('#editgear-subtype option:selected', view.$element).val() == "Choose type:") {
				alert("Choose a type of instrument, bro");
			} else {

				_.extend(view.gear.data, updatedGearData);

				view.gear.save(App.user.data.id, function(error, gear) {
					if(error) {
						console.log(error);
						return;
					}
				});

				App.router.openModalView('gearpricing', view.gear);


			}

			
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
				view.gear.data.images += url + ',';
				$thumbList = $('#editgear-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);
			});
		}
	}
);