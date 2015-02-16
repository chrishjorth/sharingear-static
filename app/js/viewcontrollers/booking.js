/**
 * Controller for the Sharingear Gear booking confirm page view.
 * We use the booking status and gear status to determine the state of this view
 * @author: Chris Hjorth
 */

'use strict';

define(
    ['underscore', 'jquery', 'config', 'viewcontroller', 'moment', 'app', 'models/gear', 'models/user', 'models/booking', 'models/localization'],
	function(_, $, Config, ViewController, Moment, App, Gear, User, Booking, Localization) {
		var didInitialize,
			didRender,

			renderPeerPic,

			toggleLoading,
			
			handleDeny,
			handleConfirm,
			handleEnd,
			handleClose;

		didInitialize = function() {
			var view = this;

			this.isLoading = false;

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.gear = view.passedData.gear;
			
            view.templateParameters = {
            	brand: this.gear.data.brand,
            	subtype: this.gear.data.subtype,
            	model: this.gear.data.model,
            	start_time: '',
            	end_time: '',
            	peer_role: (this.passedData.mode === 'owner' ? 'Requested by' : 'Owned by'),
            	name: '',
            	surname: '',
            	tagline: '',
            	email: '',
            	total: '',
            	currency: ''
            };

            this.peerUser = null;

            this.booking = new Booking.constructor({
                rootURL: Config.API_URL
            });
            this.booking.initialize();
            this.booking.data.id = this.passedData.booking_id;

            this.booking.getBookingInfo(App.user.data.id, function(error) {
                //var start_time, end_time, price, VAT, priceVAT, fee, feeVAT;
                var start_time, end_time, price, fee, total;

                if(error){
                    console.log('Error retrieving booking: ' + error);
                    return;
                }

                start_time = new Moment.tz(view.booking.data.start_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
                end_time = new Moment.tz(view.booking.data.end_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());

                price = (view.passedData.mode === 'owner' ? view.booking.data.owner_price : view.booking.data.renter_price);
				//VAT = Localization.getVAT(App.user.data.country);
				//priceVAT = price / 100 * VAT;
				
				//feeVAT = fee / 100 * VAT;
				if(view.passedData.mode === 'owner') {
					fee = price / 100 * App.user.data.seller_fee;
					total = price - fee;
				}
				else {
					fee = price / 100 * App.user.data.buyer_fee;
					total = price + fee;
				}

                _.extend(view.templateParameters, {
                	start_time: start_time.format('DD/MM/YYYY'),
                	end_time: end_time.format('DD/MM/YYYY'),
                	//price: price + priceVAT + fee + feeVAT,
                	total: (total).toFixed(2),
                	currency: (view.passedData.mode === 'owner' ? view.booking.data.owner_currency : view.booking.data.renter_currency)
                });

                view.peerUser = new User.constructor({
                	rootURL: Config.API_URL
           		});
           		view.peerUser.initialize();
           		view.peerUser.data.id = (view.passedData.mode === 'owner' ? view.booking.data.renter_id : view.gear.data.owner_id); //Depends on who is viewing the booking

           		view.peerUser.getPublicInfo(function(error) {
                	var userData = view.peerUser.data;
                	if(error) {
                		console.log('Error retrieving user info: ' + error);
                		return;
                	}
                	_.extend(view.templateParameters, {
                    	name: userData.name,
                    	surname: userData.surname,
                    	tagline: 'Sharingear first-mover',
                    	email: userData.email
                	});
                	view.render();
            	});
            });
		};

		didRender = function() {
			if(this.booking.data.booking_status === 'pending' && this.passedData.mode === 'owner') {
				$('.accept-deny', this.$element).removeClass('hidden');
			}
			else if(this.booking.data.booking_status === 'accepted' || this.booking.data.booking_status === 'rented-out') {
				$('.end', this.$element).removeClass('hidden');
			}
			else if(this.booking.data.booking_status === 'renter-returned' && this.passedData.mode === 'owner') {
				$('.end', this.$element).removeClass('hidden');
			}
			else if(this.booking.data.booking_status === 'owner-returned' && this.passedData.mode === 'renter') {
				$('.end', this.$element).removeClass('hidden');
			}
			else {
				$('.sg-close', this.$element).removeClass('hidden');
			}

			if(this.booking.data.booking_status === 'denied' || this.booking.data.booking_status === 'ended-denied')  {
				if(this.passedData.mode === 'owner') {
					$('.cancelled-owner', this.$element).removeClass('hidden');
				}
				else {
					$('.cancelled-renter', this.$element).removeClass('hidden');
				}
			}

			if(this.booking.data.booking_status === 'owner-returned' && this.passedData.mode === 'owner') {
				$('.owner-returned', this.$element).removeClass('hidden');
			}
			if(this.booking.data.booking_status === 'renter-returned' && this.passedData.mode === 'renter') {
				$('.renter-returned', this.$element).removeClass('hidden');
			}

			if(this.booking.data.booking_status === 'ended') {
				$('.ended', this.$element).removeClass('hidden');
			}

			if(this.booking.data.booking_status === 'waiting' && this.passedData.mode === 'renter') {
				$('.error', this.$element).removeClass('hidden');
			}

			this.renderPeerPic();

			this.setupEvent('click', '#booking-cancel-btn', this, this.handleClose);
			this.setupEvent('click', '#booking-deny-btn', this, this.handleDeny);
			this.setupEvent('click', '#booking-confirm-btn', this, this.handleConfirm);
			this.setupEvent('click', '#booking-close-btn', this, this.handleClose);
			this.setupEvent('click', '#booking-end-btn', this, this.handleEnd);
		};

		renderPeerPic = function() {
			var view = this,
				img;

			if(view.peerUser === null) {
        		return;
        	}

        	img = new Image();
        	img.onload = function() {
        		var backgroundSize;
        		if(img.width < img.height) {
        			backgroundSize = '100% auto';
        		} else {
        			backgroundSize = 'auto 100%';
        		}
        		$('.profile-pic', view.$element).css({
        			'background-image': 'url(' + img.src + ')',
        			'background-size': backgroundSize
        		});
        	};
        	img.src = view.peerUser.data.image_url;
		};

		toggleLoading = function($selector,initstring) {
			if(this.isLoading === true) {
				$selector.html(initstring);
				this.isLoading = false;
			}
			else {
				$selector.html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');
				this.isLoading = true;
			}
		};

        handleDeny = function(event){
        	var view = event.data;

            view.booking.data.booking_status = 'denied';
            view.booking.update(App.user.data.id, function(error) {
            	if(error) {
            		console.log(error);
            		alert('Error updating booking.');
            		return;
            	}
            	else {
            		App.router.closeModalView();
            	}
            });
        };

		handleConfirm = function(event) {
            var view = event.data;

			if(view.isLoading === true) {
				return;
			}
			view.toggleLoading($('#booking-confirm-btn',view.$element),'Confirm');

			view.booking.data.booking_status = 'accepted';
            view.booking.update(App.user.data.id, function(error) {
            	if(error) {
            		console.log(error);
            		alert('Error updating booking.');
					view.toggleLoading($('#booking-confirm-btn',view.$element),'Confirm');
					return;
            	}
            	else {
					view.toggleLoading($('#booking-confirm-btn',view.$element),'Confirm');
            		App.router.closeModalView();
            	}
            });
		};

		handleEnd = function(event) {
			var view = event.data;
			if(view.isLoading === true) {
				return;
			}

			view.toggleLoading($('#booking-end-btn',view.$element),'End booking');
			view.booking.data.booking_status = (view.passedData.mode === 'owner' ? 'owner-returned' : 'renter-returned');
			view.booking.update(App.user.data.id, function(error) {
            	if(error) {
            		console.log(error);
            		alert('Error updating booking.');
					view.toggleLoading($('#booking-end-btn',view.$element),'End booking');
            		return;
            	}
            	else {
					view.toggleLoading($('#booking-end-btn',view.$element),'End booking');
            		App.router.closeModalView();
            	}
            });
		};

		handleClose = function(event) {
			var view = event.data;

			App.router.closeModalView();

			if(view.passedData.mode === 'renter' && view.booking.data.booking_status === 'denied') {
				view.booking.data.booking_status = 'ended-denied';
				view.booking.update(App.user.data.id, function(error) {
					if(error) {
						console.log('Error updating booking status: ' + error);
					}
				});
			}
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderPeerPic: renderPeerPic,

			toggleLoading:toggleLoading,

            handleDeny : handleDeny,
			handleConfirm: handleConfirm,
			handleEnd: handleEnd,
			handleClose: handleClose
		});
	}
);