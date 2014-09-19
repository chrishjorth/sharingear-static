/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'galleria', 'app', 'models/gear'],
	function(ViewController, Galleria,App, Gear) {
		var GearProfile = ViewController.inherit({
			gear: null,

			didInitialize: didInitialize,
			didRender: didRender,
			renderGearPictures: renderGearPictures
		});

		return GearProfile;

		function didInitialize() {
			var view = this;
			Galleria.loadTheme('js/libraries/galleria_themes/classic/galleria.classic.js');

			if(this.passedData) {
				this.gear = this.passedData;
			}
			else {
				this.gear = new Gear.constructor({
					rootURL: App.API_URL
				});
				this.gear.data.id = this.subPath;
				this.gear.update(App.user.data.id, function(error) {
					if(error) {
						console.log(error);
						return;
					}
					view.templateParameters = view.gear.data;
					view.render();
				});
			}
			
			this.subPath = '';
			this.templateParameters = this.gear.data;
		}

		function didRender() {
			this.renderGearPictures();
			Galleria.run('.galleria');
		}

		function renderGearPictures() {
			var images = this.gear.data.images.split(','),
				title = 'Gear picture',
				description = 'Picture of the gear.',
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {
					html += '<img src="' + images[i] + '" alt="Gear thumb" data-title="' + title + '" data-description="' + description + '">';
				}
			}
			$('#gearprofile-galleria', this.$element).append(html);
		}
	}
);

