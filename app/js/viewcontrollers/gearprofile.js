/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear', 'googlemaps','owlcarousel'],
	function(ViewController, App, Gear, GoogleMaps, owlcarousel) {
		var GearProfile = ViewController.inherit({
			gear: null,
			map: null,

			didInitialize: didInitialize,
			didRender: didRender,
			setupView: setupView,
			renderGearPictures: renderGearPictures,
			renderMap: renderMap,
            renderOwner: renderOwner,
			handleBooking: handleBooking
		});

		return GearProfile;

		function didInitialize() {
			var view = this;


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

            var owl = $("#gearprofile-owl");

            owl.owlCarousel({
                slideSpeed: 300,
                paginationSpeed: 400,
                singleItem: true
            });

            $('.owl-controls .owl-page').append('<a class="item-link"/>');

            var pafinatorsLink = $('.owl-controls .item-link');
            var images = this.gear.data.images.split(',');

            for(var i = 0;i<pafinatorsLink.length;i++){
                $(pafinatorsLink[i]).css({
                    'background': 'url(' + images[i] + ') center center no-repeat',
                    '-webkit-background-size': 'cover',
                    '-moz-background-size': 'cover',
                    '-o-background-size': 'cover',
                    'background-size': 'cover'
                });
                $(pafinatorsLink[i]).click(function () {
                });
            }

            this.setupEvent('click', '#gearprofile-book-btn', this, this.handleBooking);
            this.renderOwner();
		}

        function renderOwner() {
            var owner = this.gear.data.owner_id;

            if (owner !== null) {
                this.gear.getUserInfo(owner, function (error,data) {

                    //Name
                    var owner_name = '<h4>' + data.name + ' ' + data.surname + "</h4>";
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


		function setupView() {
			this.renderGearPictures();
			this.renderMap();
		}

		function renderGearPictures() {
			var images = this.gear.data.images.split(','),
				description = 'Picture of the gear.',
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {

                    html += '<div class="item owl-item2"><img src="'+images[i]+'" alt="'+description+'"></div>';
				}
			}
			$('#gearprofile-owl', this.$element).append(html);
		}

		function renderMap() {
			var gear = this.gear.data,
				mapOptions, latlong, marker;
			if(gear.latitude !== null && gear.longitude !== null) {
				latlong = new GoogleMaps.LatLng(gear.latitude, gear.longitude);
				mapOptions = {
					center: latlong,
					zoom: 9
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
			var view = event.data;
			App.router.openModalView('gearbooking', view.gear);
		}
	}
);

