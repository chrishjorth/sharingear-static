/**
 * Controller for the Sharingear Van profile page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'config', 'viewcontroller', 'app', 'utilities', 'models/van', 'models/user', 'models/localization', 'googlemaps','owlcarousel', 'facebook'],
	function($, Config, ViewController, App, Utilities, Van, User, Localization, GoogleMaps, owlcarousel, FB) {
		var paymentSuccessModalOpen = false,

			didInitialize,
			didRender,
			renderOwnerPicture,
			renderVanPictures,
			renderPricing,
			renderMap,
			renderAccessories,
			renderActionButton,
			handleBooking,
            handleEditProfile,
            handleFacebookShare,
            handleTwitterShare;

		didInitialize = function() {
            var view = this;

            Localization.getCurrentTimeZone();

			view.templateParameters = {
				van_type: '',
				model: '',
				description: '',
				accessories:null,
				currency: App.user.data.currency,
				name: '',
				bio: '',
				location: '',
				owner_id: ''
			};

			view.owner = new User.constructor({
				rootURL: Config.API_URL
			});
			view.owner.initialize();

			view.availability = null;

			if(view.passedData) {
				//No need to fetch van from backend
				view.van = this.passedData;
			}
			else {
				if(view.van === null) {
					//In this case the view is loaded the first time, and not returning from a modal fx
					view.van = new Van.constructor({
						rootURL: Config.API_URL
					});
					view.van.initialize();

					view.van.data.id = view.subPath;
					view.subPath = ''; //To avoid rendering a subview based on the gear id
				}
				
				view.van.update(App.user.data.id, function(error) {
					if(error) {
						console.log(error);
						return;
					}
					view.owner.data.id = view.van.data.owner_id;
					view.owner.getPublicInfo(function(error) {
						var vanData, ownerData;
						if(error) {
							console.log(error);
							return;
						}
						vanData = view.van.data;
						ownerData = view.owner.data;
						view.templateParameters = {
							van_type: vanData.van_type,
							model: vanData.model,
							description: vanData.description,
							accessories: vanData.accessories,
							currency: App.user.data.currency,
							name: ownerData.name + ' ' + ownerData.surname.substring(0, 1) + '.',
							bio: ownerData.bio,
							location: vanData.city + ', ' + vanData.country,
							owner_id: vanData.owner_id
						};
						view.render();
					});

					view.van.getAvailability(function(error, result) {
            			if(error) {
            				console.log('Error getting van availability: ' + error);
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
				App.header.setTitle(this.van.data.van_type);
			}
			
			this.renderVanPictures();
			this.renderPricing();
			this.renderOwnerPicture();
			this.renderAccessories();
			this.renderMap();

            this.renderActionButton();

            this.setupEvent('click', '#vanprofile-action-book', this, this.handleBooking);
            this.setupEvent('click', '#vanprofile-action-edit', this, this.handleEditProfile);
            this.setupEvent('click', '#vanprofile-fb-btn', this, this.handleFacebookShare);
            this.setupEvent('click', '#vanprofile-tw-btn', this, this.handleTwitterShare);

            //Check for querystring sent by a booking payment process
			preAuthorizationID = Utilities.getQueryStringParameterValue(window.location.search, 'preAuthorizationId');
			bookingID = Utilities.getQueryStringParameterValue(window.location.search, 'booking_id');
			if(paymentSuccessModalOpen === false && preAuthorizationID && bookingID) {
				App.router.openModalView('paymentsuccessful', {
					preAuthorizationID: preAuthorizationID,
					bookingID: bookingID,
					van: this.van
				});
				paymentSuccessModalOpen = true;
			}
		};

		renderAccessories = function () {
			var accessories = this.van.data.accessories, i,html='';

			if (accessories===null||accessories.length===0) {
				html = 'This van doesn\'t have any accessories.';
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
        	var view = this,
        		img, isVertical, backgroundSize;
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
        		$('.profile-pic', view.$element).css({
        			'background-image': 'url(' + img.src + ')',
        			'background-size': backgroundSize
        		});
        	};
        	img.src = this.owner.data.image_url;
        };

		renderVanPictures = function() {
			var $owlContainer = $('.owl-carousel', this.$element),
				images = this.van.data.images.split(','),
				description = 'Van picture.',
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

		renderPricing = function() {
			var view = this;
			Localization.convertPrices([this.van.data.price_a, this.van.data.price_b, this.van.data.price_c], this.van.data.currency, App.user.data.currency, function(error, convertedPrices) {
				if(error) {
					console.log('Could not convert prices: ' + error);
					return;
				}
				$('#vanprofile-price_a', view.$element).html(Math.ceil(convertedPrices[0]));
				$('#vanprofile-price_b', view.$element).html(Math.ceil(convertedPrices[1]));
				$('#vanprofile-price_c', view.$element).html(Math.ceil(convertedPrices[2]));
			});
		};

		renderMap = function() {
			var van = this.van.data,
				mapOptions, latlong, marker;
			if(van.latitude !== null && van.longitude !== null) {
				latlong = new GoogleMaps.LatLng(van.latitude, van.longitude);
				mapOptions = {
					center: latlong,
					zoom: 14,
					maxZoom: 14
				};
				this.map = new GoogleMaps.Map(document.getElementById('vanprofile-map'), mapOptions);
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
						view.initialize();
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
					van: view.van,
					owner: view.owner
				};
				App.router.openModalView('vanbooking', passedData);
			}
		};

        handleEditProfile = function (event) {
            var view = event.data;
            App.router.openModalView('editvan', view.van);
        };

        handleFacebookShare = function (event) {
            var view = event.data;
            var url, description;

            url = 'https://www.sharingear.com/#vanprofile/' + view.van.data.id;
            description = 'Check out this ' + view.van.data.van_type + ' on Sharingear!' + url;

            FB.ui({
                method: 'feed',
                caption: 'www.sharingear.com',
                link: url,
                description: description
            });
        };

        handleTwitterShare = function(event){
            var view = event.data,
                twtTitle = 'Check out this ' + view.van.data.van_type + ' on www.sharingear.com',
                twtUrl = 'https://www.sharingear.com/#vanprofile/' + view.van.data.id,
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
				$('#vanprofile-action-book', view.$element).removeClass('hidden');
				return;    	
            }

            if(App.user.data.id == view.van.data.owner_id) {
				$('#vanprofile-action-edit', view.$element).removeClass('hidden');
				return;
			}

			if(view.availability !== null) {
				if(view.availability.alwaysFlag === 1 || view.availability.availabilityArray.length > 0) {
					$('#vanprofile-action-book', view.$element).removeClass('hidden');
				}
				else {
					$('#vanprofile-action-unavailable', view.$element).removeClass('hidden');
				}
			}
		};

		return ViewController.inherit({
			hasSubviews: false,
			van: null,
			owner: null,
			map: null,

			didInitialize: didInitialize,
			didRender: didRender,
			renderVanPictures: renderVanPictures,
			renderPricing: renderPricing,
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

