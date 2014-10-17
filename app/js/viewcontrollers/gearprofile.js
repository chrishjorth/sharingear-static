/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

define(
	['viewcontroller', 'app', 'models/gear', 'googlemaps','owlcarousel','magnificpopup'],
	function(ViewController, App, Gear, GoogleMaps, owlcarousel, magnificPopup) {
		var GearProfile = ViewController.inherit({
			gear: null,
			map: null,

			didInitialize: didInitialize,
			didRender: didRender,
			renderGearPictures: renderGearPictures,
			renderMap: renderMap,
            renderOwner: renderOwner,
			handleBooking: handleBooking,
			renderPopup: renderPopup
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
			var $owl, $paginatorsLink, images, i;
			
			this.renderGearPictures();
			this.renderMap();

            $owl = $('#gearprofile-owl', this.$element);

            $owl.owlCarousel({
                slideSpeed: 300,
                paginationSpeed: 400,
                singleItem: true
            });

            this.renderPopup();
	        
            $('.owl-controls .owl-page').append('<a class="item-link"/>');

            $paginatorsLink = $('.owl-controls .item-link', this.$element);
            images = this.gear.data.images.split(',');

            for(i = 0; i < $paginatorsLink.length; i++){
                $($paginatorsLink[i]).css({
                    'background': 'url(' + images[i] + ') center center no-repeat',
                    '-webkit-background-size': 'cover',
                    '-moz-background-size': 'cover',
                    '-o-background-size': 'cover',
                    'background-size': 'cover'
                });
                $($paginatorsLink[i]).click();
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

		function renderGearPictures() {
			var images = this.gear.data.images.split(','),
				description = 'Picture of the gear.',
				html = '',
				i;
			for(i = 0; i < images.length; i++) {
				//Avoid empty url strings because of trailing ','
				if(images[i].length > 0) {

                    html += '<div class="item owl-item2"><img src="'+images[i]+'" alt="'+description+'" ></div>';
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
			var view = event.data,
				user = App.user;
			if(user.data.id === null) {
				user.login(function(error) {
					if(!error) {
						App.router.openModalView('gearbooking', view.gear);
					}
					else {
						alert('You need to be logged in, in order to book an instrument.');
					}
				});
			}
			else {
				App.router.openModalView('gearbooking', view.gear);
			}
		}

		// gets images used for rendering gear and uses them to render popup gallery.
		function renderPopup() {
			var view = this;
    		// get images that are used for owl carousel
            var images = view.gear.data.images.split(',');
            // use same images for magnificpopup
            // create array of items with src field
            var items = [];
            for (var i = 0; i < images.length; i++) {
            	if (images[i]!="") {
            		items.push({src:images[i]});
            	}
            };

			// click on item image => open lightbox fullscreen gallery thing
            $('.owl-item2 img').magnificPopup({
            	type: 'image',
            	items: items,
            	gallery: {enabled: true}
            });


		}

		// gets images used for rendering gear and uses them to render popup gallery.
		function renderPopup() {
			var view = this;
    		// get images that are used for owl carousel
            var images = view.gear.data.images.split(',');
            // use same images for magnificpopup
            // create array of items with src field
            var items = [];
            for (var i = 0; i < images.length; i++) {
            	if (images[i]!="") {
            		items.push({src:images[i]});
            	}
            };

			// click on item image => open lightbox fullscreen gallery thing
            $('.owl-item2 img').magnificPopup({
            	type: 'image',
            	items: items,
            	gallery: {enabled: true}
            });


		}
	}
);

