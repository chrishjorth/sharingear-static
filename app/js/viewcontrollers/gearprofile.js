/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'galleria', 'app', 'models/gear', 'googlemaps'],
	function(ViewController, Galleria, App, Gear, GoogleMaps) {
		var GearProfile = ViewController.inherit({
			gear: null,
			map: null,

			didInitialize: didInitialize,
			didRender: didRender,
			setupView: setupView,
			renderGearPictures: renderGearPictures,
			renderMap: renderMap,
<<<<<<< HEAD
            renderOwner: renderOwner
=======

			handleBooking: handleBooking
>>>>>>> 5f22914cc46d5ecdd5a19e08aee0bdff8e193588
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
			this.setupView();
			Galleria.run('.galleria');
<<<<<<< HEAD
            this.renderOwner();
		}

        function renderOwner() {
            var owner = this.gear.data.owner_id;

            if (owner !== null) {
                console.log("This guy: "+owner);
                this.gear.getUserInfo(owner, function (error,data) {

                    //Name
                    var owner_name = '<h4'+'>'+data.name+' '+data.surname+'<img class="pull-right" src="images/icon-fbicon.png"'+'></'+'h4>';
                    $('#owner_name').html(owner_name);

                    //Image handling
                    var isVertical;
                    var img = new Image();
                    img.src = data.image_url;
                    var imgWidth = img.width;
                    var imgHeight = img.height;
                    isVertical = imgWidth < imgHeight;

                    var owner_picture_url = 'url('+data.image_url+')';
                    $('#owner_picture').css("background-image",owner_picture_url);
                    $('#owner_picture').css("margin-top","65px");
                    if (isVertical) {
                        $('#owner_picture').css("background-size","auto "+imgWidth);
                    }else{
                        $('#owner_picture').css("background-size",imgHeight+ "auto");
                    }


                    //Bio
                    $('#owner_bio').html('<p'+'>'+data.bio+'</'+'p>');
                });
            }

        }
=======
			this.setupEvent('click', '#gearprofile-book-btn', this, this.handleBooking);
		}

		function setupView() {
			this.renderGearPictures();
			this.renderMap();
		}
>>>>>>> 5f22914cc46d5ecdd5a19e08aee0bdff8e193588

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

		function renderMap() {
			var gear = this.gear.data,
				mapOptions, latlong, marker;
			if(gear.latitude !== null && gear.longitude !== null) {
				latlong = new GoogleMaps.LatLng(gear.latitude, gear.longitude);
				mapOptions = {
					center: latlong,
					zoom: 8
				};
				this.map = new GoogleMaps.Map(document.getElementById('gearprofile-map'), mapOptions);
				var marker = new GoogleMaps.Marker({
					position: latlong,
					map: this.map,
					title: 'BOOM!'
				});
			}

			$('.adress_click', this.$element).html(gear.address + ' ' + gear.postal_code + ' ' + gear.city + ' ' + gear.region + ' ' + gear.country);
		}

		function handleBooking(event) {
			var view = this;
			console.log('BOOK ALREADY!');
		}
	}
);

