/**
 * Controller for the Sharingear Add gear photos dashboard page view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'viewcontroller', 'app', 'models/gear'],
	function(_, ViewController, App, Gear) {
		var AddGearPhotos = ViewController.inherit({
			newGear: null,
			
			didInitialize: didInitialize,
			didRender: didRender,
			populatePhotos: populatePhotos,
			handleImageUpload: handleImageUpload,
			handleNext: handleNext,
			handleBreadcrumbBack: handleBreadcrumbBack
		}); 
		return AddGearPhotos;

		function didInitialize() {
			this.newGear = new Gear.constructor({
				rootURL: App.API_URL,
				data: {
					images: ''
				}
			});

			console.log('AddGearPhotos passed data:');
			console.log(this.passedData);

			if(this.passedData) {
				_.extend(this.newGear.data, this.passedData.data);
				console.log('after passed data merge');
				console.log(this.newGear);
			}
		}

		function didRender() {
			this.populatePhotos();
			this.setupEvent('change', '#dashboard-addgearphotos-form-imageupload', this, this.handleImageUpload);
			this.setupEvent('submit', '#dashboard-addgearphotos-form', this, this.handleNext);
			this.setupEvent('click', '.addgearpanel .btnaddgeartwo', this, this.handleBreadcrumbBack);
		}

		function populatePhotos() {
			var images = this.newGear.data.images.split(','),
				html = '',
				i;
			console.log('after split');
			console.log(this.newGear);
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {
					html += '<li><img src="' + images[i] + '" alt="Gear thumb"></li>';
				}
			}
			$('#dashboard-addgearphotos-form .thumb-list-container ul', this.$element).append(html);
		}

		function handleImageUpload(event) {
			var view = event.data
				$file = $(this);
			view.newGear.uploadImage($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
				var $thumbList, html;
				if(error) {
					alert('Error uploading file.');
					console.log(error);
					return;
				}
				console.log('gear data:');
				console.log(view.newGear.data);
				console.log('url:');
				console.log(url);
				view.newGear.data.images += url + ',';
				$thumbList = $('#dashboard-addgearphotos-form .thumb-list-container ul', view.$element);
				html = '<li><img src="' + url + '" alt="Gear thumb"></li>';
				$thumbList.append(html);
			});
		}

		function handleNext(event) {
			var view = event.data;
			App.router.navigateTo('dashboard/addgearprice', view.newGear);
		}

		function handleBreadcrumbBack(event) {
			var view = event.data;
			App.router.navigateTo('dashboard/addgear', view.newGear);
		}
	}
);