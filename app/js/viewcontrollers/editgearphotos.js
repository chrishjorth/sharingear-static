/**
 * Controller for the Sharingear Edit gear photos page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear'],
	function(ViewController, App, Gear) {
		var EditGear = ViewController.inherit({
			gear: null,

			didInitialize: didInitialize,
			didRender: didRender,
			populateImages: populateImages,
			setupEvents: setupEvents,
			handleBack: handleBack,
			handleNext: handleNext,
			handleImageUpload: handleImageUpload
		});
		return EditGear;

		function didInitialize() {
			this.gear = this.passedData;
		}

		function didRender() {
			this.populateImages();
			this.setupEvents();
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

		function setupEvents() {
			this.setupEvent('click', '#editgear-photos-form .btn-back', this, this.handleBack);
			this.setupEvent('click', '#editgear-photos-form .btn-next', this, this.handleNext);
			this.setupEvent('change', '#editgear-photos-form-imageupload', this, this.handleImageUpload);
		}

		function handleBack(event) {
			var view = event.data,
				updatedGearData;

			view.gear.save(App.user.data.id, function(error, gear) {
				if(error) {
					console.log(error);
					return;
				}
			});

			App.router.openModalView('editgear', view.gear);
		}

		function handleNext(event) {
			var view = event.data,
				updatedGearData;

			view.gear.save(App.user.data.id, function(error, gear) {
				if(error) {
					console.log(error);
					return;
				}
			});

			App.router.openModalView('editgearpricing', view.gear);
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
	}
);
