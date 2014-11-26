/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth, Horatiu Roman
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'utilities', 'models/gear', 'models/user', 'googlemaps','owlcarousel','magnificpopup', 'facebook'],
	function($, ViewController, App, Utilities, Gear, User, GoogleMaps, owlcarousel, magnificPopup, FB) {

		var paymentSuccessModalOpen = false,

			didInitialize,
			didRender,
			renderOwnerPicture,
			renderGearPictures,
			renderMap,
			handleBooking,
            handleEditProfile,
            handleFacebookShare,
            handleTwitterShare,
			renderPopup,
			addEditButtonIfOwner;

		didInitialize = function() {
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

			view.owner = new User.constructor({
				rootURL: App.API_URL
			});

			if(view.passedData) {
				//No need to fetch gear from backend
				view.gear = this.passedData;
			}
			else {
				if(view.gear === null) {
					//In this case the view is loaded the first time, and not returning from a modal fx
					view.gear = new Gear.constructor({
						rootURL: App.API_URL
					});
					view.gear.data.id = view.subPath;
					view.subPath = ''; //To avoid rendering a subview based on the gear id
				}
				
				view.gear.update(App.user.data.id, function(error) {
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
						};
						view.render();
					});
				});
			}
		};

		didRender = function() {
            var $owl, $paginatorsLink, images, i, preAuthorizationID, bookingID;
			
			this.renderGearPictures();
			this.renderOwnerPicture();
			this.renderMap();

            $owl = $('#gearprofile-owl', this.$element);

            $owl.owlCarousel({
                slideSpeed: 300,
                paginationSpeed: 400,
                singleItem: true
            });
	        
            $('.owl-controls .owl-page').append('<a class=\"item-link\"/>');

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

            this.setupEvent('click', '#gearprofile-book-btn', this, this.handleBooking);
            this.setupEvent('click', '#gearprofile-edit-btn', this, this.handleEditProfile);
            this.setupEvent('click', '#fb-share-gear', this, this.handleFacebookShare);
            this.setupEvent('click', '#tw-share-gear', this, this.handleTwitterShare);

            //Check for querystring sent by a booking payment process
			preAuthorizationID = Utilities.getQueryStringParameterValue(window.location.search, 'preAuthorizationId');
			bookingID = Utilities.getQueryStringParameterValue(window.location.search, 'booking_id');
			if(paymentSuccessModalOpen === false && preAuthorizationID && bookingID) {
				App.router.openModalView('paymentsuccessful', {
					preAuthorizationID: preAuthorizationID,
					bookingID: bookingID,
					gear_id: this.gear.data.id
				});
				paymentSuccessModalOpen = true;
			}

            this.gear.getAvailability(App.user.data.id, function(error, result) {
            	var mustDisable = false;
            	if(error) {
            		console.log('Error getting gear availability: ' + error);
            		mustDisable = true;
            	}
                else if(result.alwaysFlag === 0) {
                    mustDisable = true;
                }
                if(mustDisable === true) {
                	$('#gearprofile-book-btn').prop('disabled', true);
                    $('#gearprofile-book-btn').html('Not available');
                    $('#gearprofile-book-btn').addClass('disabled-btn');
                }
            });
		};


        renderOwnerPicture = function() {
        	var img, isVertical, backgroundSize;
        	if(!this.owner.data.image_url) {
        		return;
        	}
        	img = new Image();
        	img.onload = function() {
        		isVertical = img.width < img.height;
        		if(isVertical === true) {
        			backgroundSize = '205px auto';
        		}
        		else {
        			backgroundSize = 'auto 205px';
        		}
        		$('#owner_picture').css({
        			'background-image': 'url(' + img.src + ')',
        			'background-size': backgroundSize
        		});
        	};
        	img.src = this.owner.data.image_url;
        };

		renderGearPictures = function() {
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
		};

		renderMap = function() {
			var gear = this.gear.data,
				mapOptions, latlong, marker;
			if(gear.latitude !== null && gear.longitude !== null) {
				latlong = new GoogleMaps.LatLng(gear.latitude, gear.longitude);
				mapOptions = {
					center: latlong,
					zoom: 14,
					maxZoom: 14
				};
				this.map = new GoogleMaps.Map(document.getElementById('gearprofile-map'), mapOptions);
				marker = new GoogleMaps.Marker({
					position: latlong,
					map: this.map,
					icon: 'images/shagicon_003.png' // TODO: put icon on server
				});
			}

			$('.adress_click', this.$element).html(/*gear.address + ' ' + */gear.postal_code + ' ' + gear.city + ' ' + gear.region + ', ' + gear.country);
		};

		handleBooking = function(event) {
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
		};

        handleEditProfile = function (event) {
            var view = event.data;
            App.router.openModalView('editgear', view.gear);
        };

        handleFacebookShare = function (event) {
            var view = event.data;
            var url, instrument, description;

            url = window.location.href;
            instrument = view.gear.data.brand;
            description = 'Check out this ' + instrument + ' on Sharingear!' + url;

            FB.ui({
                method: 'feed',
                caption: 'www.sharingear.com',
                link: url,
                description: description
            });
        };

        handleTwitterShare = function(event){
            var view = event.data,
                twtTitle = 'Check out this ' + view.gear.data.brand + ' on www.sharingear.com',
                twtUrl = location.href,
                maxLength = 140 - (twtUrl.length + 1),
                twtLink;

            twtTitle = twtTitle.length > maxLength ? twtTitle.substr(0, (maxLength - 3)) + '...' : twtTitle;
            twtLink = '//twitter.com/home?status=' + encodeURIComponent(twtTitle + ' ' + twtUrl);

            window.open(twtLink);
        };
		// gets images used for rendering gear and uses them to render popup gallery.
		renderPopup = function() {
			var view = this;
    		// get images that are used for owl carousel
            var images = view.gear.data.images.split(',');
            // use same images for magnificpopup
            // create array of items with src field
            var items = [];
            for (var i = 0; i < images.length; i++) {
            	if (images[i] !== '') {
            		items.push({src:images[i]});
            	}
            }

			// click on item image => open lightbox fullscreen gallery thing
            $('.owl-item2 img').magnificPopup({
            	type: 'image',
            	items: items,
            	gallery: {enabled: true}
            });
		};

		addEditButtonIfOwner = function() {
			var view = this;
			// if user is logged in AND is owner, add edit button
			if(App.user.data.id == view.gear.data.owner_id) {
				$('#gearprofile-edit-btn', view.$element).removeClass('hidden');
			}
			else {
				$('#gearprofile-book-btn', view.$element).removeClass('hidden');
			}
		};

		return ViewController.inherit({
			hasSubviews: false,
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
            handleEditProfile: handleEditProfile,
            handleFacebookShare: handleFacebookShare,
            handleTwitterShare: handleTwitterShare
		});
	}
);

