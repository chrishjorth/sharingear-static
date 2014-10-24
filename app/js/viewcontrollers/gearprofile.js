/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

define(
	['viewcontroller', 'app', 'models/gear', 'models/user', 'googlemaps','owlcarousel','magnificpopup'],
	function(ViewController, App, Gear, User, GoogleMaps, owlcarousel, magnificPopup) {
		var GearProfile = ViewController.inherit({
			gear: null,
			owner: null,
			map: null,

			didInitialize: didInitialize,
			didRender: didRender,
			renderGearPictures: renderGearPictures,
			renderMap: renderMap,
            renderOwnerPicture: renderOwnerPicture,
			renderPopup: renderPopup,
			addEditButtonIfOwner: addEditButtonIfOwner,
			handleBooking: handleBooking,
		});

		return GearProfile;

		function didInitialize() {
			var view = this;

			view.templateParameters = {
				brand: '',
				subtype: '',
				model: '',
				description: '',
				price_a: '',
				price_b: '',
				price_c: '',
				name: '',
				bio: ''
			};

			if(this.passedData) {
				this.gear = this.passedData;
			}
			else {
				this.gear = new Gear.constructor({
					rootURL: App.API_URL
				});
				this.gear.data.id = this.subPath;

				view.owner = new User.constructor({
					rootURL: App.API_URL
				});

				this.gear.update(App.user.data.id, function(error) {
					if(error) {
						console.log(error);
						return;
					}
					view.owner.data.id = view.gear.data.owner_id;
					view.owner.getPublicInfo(function(error) {
						var gearData, ownerData;
						if(error) {
							console.log(error);
							return;
						}
						gearData = view.gear.data;
						ownerData = view.owner.data;
						view.templateParameters = {
							brand: gearData.brand,
							subtype: gearData.subtype,
							model: gearData.model,
							description: gearData.description,
							price_a: gearData.price_a,
							price_b: gearData.price_b,
							price_c: gearData.price_c,
							name: ownerData.name + ' ' + ownerData.surname,
							bio: ownerData.bio
						}
						view.render();
					});
				});
			}

			this.subPath = ''; //To avoid rendering a subview based on the gear id
		}

		function didRender() {
            var view= this;
			var $owl, $paginatorsLink, images, i;
			
			this.renderGearPictures();
			this.renderOwnerPicture();
			this.renderMap();

            $owl = $('#gearprofile-owl', this.$element);

            $owl.owlCarousel({
                slideSpeed: 300,
                paginationSpeed: 400,
                singleItem: true
            });
	        
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

            this.renderPopup();

            this.addEditButtonIfOwner();

            $('#fb-share-gear').on('click', function(event) {

                var url = window.location.href;
                instrument = view.gear.data.brand;
                description = "Check out this "+instrument+" on Sharingear!"+url;

                FB.ui({
                    method: 'feed',
                    caption: 'www.sharingear.com',
                    link: url,
                    description: description
                }, function(response) {
                    //console.log(response);
                });

            });

            $('#tw-share-gear').on('click', function(event) {

                var twtTitle = "Check out this "+view.gear.data.brand+" on www.sharingear.com";
                var twtUrl = location.href;
                var maxLength = 140 - (twtUrl.length + 1);
                if (twtTitle.length > maxLength) {
                    twtTitle = twtTitle.substr(0, (maxLength - 3)) + '...';
                }
                var twtLink = 'http://twitter.com/home?status=' + encodeURIComponent(twtTitle + ' ' + twtUrl);
                window.open(twtLink);

            });


            this.setupEvent('click', '#gearprofile-book-btn', this, this.handleBooking);
		}


        function renderOwnerPicture() {
        	var img, isVertical, backgroundSize;
        	if(!this.owner.data.image_url) {
        		return;
        	}
        	img = new Image();
        	img.onload = function() {
        		isVertical = img.width < img.height;
        		if(isVertical === true) {
        			backgroundSize = 'auto ' + img.width;
        		}
        		else {
        			backgroundSize = img.height + ' auto';
        		}
        		$('#owner_picture').css({
        			'background-image': 'url(' + img.src + ')',
        			'background-size': backgroundSize
        		});
        	};
        	img.src = this.owner.data.image_url;
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

		function addEditButtonIfOwner() {
			var view = this;

			console.log("logged in user is " + App.user.data.id + " and gear is owned by " + view.gear.data.owner_id);

			// if user is logged in AND is owner, add edit button
			if(App.user.data.id == view.gear.data.owner_id) {
				$("#editButton").html("<input class='btn btn-info pull-right' type='button' value='Edit'>");
				$("#editButton").on("click", function() {
					App.router.openModalView('editgear', view.gear);
					// on modal view close, refresh view. (render?)
				});
			}
			
		}
	}
);

