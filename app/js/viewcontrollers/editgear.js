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
			$('#editgear-brand', this.$element).val(this.passedData.brand);
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
				model: $('#editgear-model', view.$element).val(),
				description: $('#editgear-description', view.$element).val()
			};

			_.extend(view.gear.data, updatedGearData);

			view.gear.save(App.user.data.id, function(error, gear) {
				if(error) {
					console.log(error);
					return;
				}
			});

			App.router.openModalView('gearpricing', view.gear);
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