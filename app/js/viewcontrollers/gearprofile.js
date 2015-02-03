/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'utilities', 'models/gear', 'models/user', 'googlemaps','owlcarousel', 'facebook'],
	function($, ViewController, App, Utilities, Gear, User, GoogleMaps, owlcarousel, FB) {

		var paymentSuccessModalOpen = false,

			didInitialize,
			didRender,
			renderOwnerPicture,
			renderGearPictures,
			renderMap,
			renderAccessories,
			renderActionButton,
			handleBooking,
            handleEditProfile,
            handleFacebookShare,
            handleTwitterShare;

		didInitialize = function() {
            var view = this;

			view.templateParameters = {
				brand: '',
				gear_type: '',
				subtype: '',
				model: '',
				description: '',
				accessories:null,
				price_a: '',
				price_b: '',
				price_c: '',
				name: '',
				bio: '',
				location: '',
				owner_id: ''
			};

			view.owner = new User.constructor({
				rootURL: App.API_URL
			});
			view.owner.initialize();

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
					view.gear.initialize();

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
							gear_type: gearData.gear_type,
							subtype: gearData.subtype,
							model: gearData.model,
							description: gearData.description,
							accessories: gearData.accessories,
							price_a: gearData.price_a,
							price_b: gearData.price_b,
							price_c: gearData.price_c,
							name: ownerData.name + ' ' + ownerData.surname.substring(0, 1) + '.',
							bio: ownerData.bio,
							location: gearData.city + ', ' + gearData.country,
							owner_id: gearData.owner_id
						};
						view.render();
					});

					view.gear.getAvailability(App.user.data.id, function(error, result) {
            			if(error) {
            				console.log('Error getting gear availability: ' + error);
            				return;
            			}
            			view.availability = result;
            			view.render();
            		});
				});
			}
		};

		didRender = function() {
            var preAuthorizationID, bookingID;

            if(App.header) {
				App.header.setTitle(this.gear.data.gear_type);
			}
			
			this.renderGearPictures();
			this.renderOwnerPicture();
			this.renderAccessories();
			this.renderMap();

            this.renderActionButton();

            this.setupEvent('click', '#gearprofile-action-book', this, this.handleBooking);
            this.setupEvent('click', '#gearprofile-action-edit', this, this.handleEditProfile);
            this.setupEvent('click', '#gearprofile-fb-btn', this, this.handleFacebookShare);
            this.setupEvent('click', '#gearprofile-tw-btn', this, this.handleTwitterShare);

            //Check for querystring sent by a booking payment process
			preAuthorizationID = Utilities.getQueryStringParameterValue(window.location.search, 'preAuthorizationId');
			bookingID = Utilities.getQueryStringParameterValue(window.location.search, 'booking_id');
			if(paymentSuccessModalOpen === false && preAuthorizationID && bookingID) {
				App.router.openModalView('paymentsuccessful', {
					preAuthorizationID: preAuthorizationID,
					bookingID: bookingID,
					gear: this.gear
				});
				paymentSuccessModalOpen = true;
			}
		};

		renderAccessories = function () {
			var accessories = this.gear.data.accessories, i,html='';

			if (accessories===null||accessories.length===0) {
				html = 'This gear doesn\'t have any accessories.';
				$('#accessories-holder', this.$element).html(html);
				return;
			}

			html+='This instrument is delivered with:<br><ul class="acclist">';
			for(i=0;i<accessories.length;i++){
				html+='<li>'+accessories[i]+'</li>';
			}
			html+='</ul>';
			$('#accessories-holder',this.$element).html(html);
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
        			backgroundSize = '100% auto';
        		}
        		else {
        			backgroundSize = 'auto 100%';
        		}
        		$('.profile-pic').css({
        			'background-image': 'url(' + img.src + ')',
        			'background-size': backgroundSize
        		});
        	};
        	img.src = this.owner.data.image_url;
        };

		renderGearPictures = function() {
			var $owlContainer = $('.owl-carousel', this.$element),
				images = this.gear.data.images.split(','),
				description = 'Gear picture.',
				html = '',
				i;

			for(i = 0; i < images.length; i++) {
				if(images[i].length > 0) {
                    html += '<div class="item"><img src="' + images[i] + '" alt="' + description + '" ></div>';
				}
			}
			$owlContainer.append(html);

            $owlContainer.owlCarousel({
                slideSpeed: 300,
                paginationSpeed: 400,
                singleItem: true
            });
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
					icon: 'images/map_pin.png' // TODO: put icon on server
				});
			}
		};

		handleBooking = function(event) {
			var view = event.data,
				user = App.user,
				passedData;
			if(user.data.id === null) {
				user.login(function(error) {
					if(!error) {
						view.render();
						App.header.render();
					}
					else {
						alert('You need to be logged in, in order to book an instrument.');
					}
				});
			}
			else {
				passedData = {
					gear: view.gear
				};
				App.router.openModalView('gearbooking', passedData);
			}
		};

        handleEditProfile = function (event) {
            var view = event.data;
            App.router.openModalView('editgear', view.gear);
        };

        handleFacebookShare = function (event) {
            var view = event.data;
            var url, instrument, description;

            url = 'https://www.sharingear.com/#gearprofile/' + view.gear.data.id;
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
                twtUrl = 'https://www.sharingear.com/#gearprofile/' + view.gear.data.id,
                maxLength = 140 - (twtUrl.length + 1),
                twtLink;

            twtTitle = twtTitle.length > maxLength ? twtTitle.substr(0, (maxLength - 3)) + '...' : twtTitle;
            twtLink = '//twitter.com/home?status=' + encodeURIComponent(twtTitle + ' ' + twtUrl);

            window.open(twtLink);
        };

		renderActionButton = function() {
			var view = this;

			$('.button-container button', view.$element).each(function() {
				var $this = $(this);
				if($this.hasClass('hidden') === false) {
					$this.addClass('hidden');
				}
			});

			if(App.user.data.id === null) {
				$('#gearprofile-action-book', view.$element).removeClass('hidden');
				return;    	
            }

            if(App.user.data.id == view.gear.data.owner_id) {
            	console.log('user id: ' + App.user.data.id + ' owner id: ' + view.gear.data.owner_id);
				$('#gearprofile-action-edit', view.$element).removeClass('hidden');
				return;
			}

			if(view.availability.alwaysFlag === 1 || view.availability.availabilityArray.length > 0) {
				$('#gearprofile-action-book', view.$element).removeClass('hidden');
			}
			else {
				$('#gearprofile-action-unavailable', view.$element).removeClass('hidden');
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
			renderAccessories: renderAccessories,
            renderOwnerPicture: renderOwnerPicture,
			renderActionButton: renderActionButton,
			handleBooking: handleBooking,
            handleEditProfile: handleEditProfile,
            handleFacebookShare: handleFacebookShare,
            handleTwitterShare: handleTwitterShare
		});
	}
);

