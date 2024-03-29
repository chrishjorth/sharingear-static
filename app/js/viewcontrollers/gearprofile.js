/**
 * Controller for the Sharingear Gear profile page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
	FB = require('../libraries/mscl-facebook.js'),
	GoogleMaps = require('../libraries/mscl-googlemaps.js'),

	Config = require('../config.js'),
	Utilities = require('../utilities.js'),
	ViewController = require('../viewcontroller.js'),
	App = require('../app.js'),

	Localization = require('../models/localization.js'),
	Gear = require('../models/gear.js'),
	User = require('../models/user.js'),
    ImagePopup = require('../popups/imagepopup.js'),

	paymentSuccessModalOpen = false;

function GearProfile(options) {
    ViewController.call(this, options);
    this.hasSubviews = false;
    this.gear = null;
    this.owner = null;
    this.map = null;
}

GearProfile.prototype = new ViewController();

GearProfile.prototype.didInitialize = function() {
    var view = this,
        subPathComponents;

    Localization.getCurrentTimeZone();

    view.templateParameters = {
        brand: '',
        gear_type: '',
        subtype: '',
        model: '',
        description: '',
        accessories: null,
        displayed_price_a: '',
        displayed_price_b: '',
        displayed_price_c: '',
        currency: App.user.data.currency,
        name: '',
        bio: '',
        location: '',
        owner_id: ''
    };

    view.owner = new User({
        rootURL: Config.API_URL
    });
    view.owner.initialize();

    view.availability = null;

    if (view.passedData) {
        //No need to fetch gear from backend
        view.gear = this.passedData;
        view.render();
    } else {
        if (view.gear === null) {
            //In this case the view is loaded the first time, and not returning from a modal fx
            view.gear = new Gear({
                rootURL: Config.API_URL
            });
            view.gear.initialize();

            subPathComponents = view.subPath.split('/');
            view.gear.data.id = subPathComponents[0];
            view.subPath = ''; //To avoid rendering a subview based on the gear id
        }
        else {
            view.gear.initialize(); //Model cleanup
        }

        view.gear.update(App.user.data.id, function(error) {
            var publicInfoDeferred = $.Deferred(), 
                availabilityDeferred = $.Deferred();
            if (error) {
                console.error(error);
                return;
            }
            view.owner.data.id = view.gear.data.owner_id;
            view.owner.getPublicInfo(function(error) {
                var gearData, ownerData;
                if (error) {
                    console.error(error);
                    return;
                }
                gearData = view.gear.data;
                ownerData = view.owner.data;
                _.extend(view.templateParameters, {
                    brand: gearData.brand,
                    gear_type: gearData.gear_type,
                    subtype: gearData.subtype,
                    model: gearData.model,
                    description: gearData.description,
                    accessories: gearData.accessories,
                    currency: App.user.data.currency,
                    name: ownerData.name + ' ' + ownerData.surname.substring(0, 1) + '.',
                    bio: ownerData.bio,
                    location: gearData.city + ', ' + gearData.country,
                    owner_id: gearData.owner_id
                });
                publicInfoDeferred.resolve();

                view.setTitle('Sharingear - ' + gearData.brand + ' ' + gearData.subtype + ' ' + gearData.model);
                view.setDescription(gearData.description);
            });

            view.gear.getAvailability(App.user.data.id, function(error, result) {
                if (error) {
                    console.error('Error getting gear availability: ' + error);
                    if(error.code === Config.ERR_AUTH) {
                        alert('Your login session expired.');
                        App.router.navigateTo('home');
                    }
                    return;
                }
                view.availability = result;
                availabilityDeferred.resolve();
            });

            $.when(publicInfoDeferred, availabilityDeferred).then(function() {
                view.render();
            });
        });
    }
};

GearProfile.prototype.didRender = function() {
    var preAuthorizationID, bookingID;

    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle(this.gear.data.gear_type);
        App.rootVC.header.enableBackButton();
    }

    this.renderPricing();
    this.renderGearPictures();
    this.renderOwnerPicture();
    this.renderAccessories();
    this.renderMap();

    this.renderActionButton();

    this.setupEvent('click', '#gearprofile-action-book', this, this.handleBooking);
    this.setupEvent('click', '#gearprofile-action-edit', this, this.handleEditProfile);
    this.setupEvent('click', '#gearprofile-fb-btn', this, this.handleFacebookShare);
    this.setupEvent('click', '#gearprofile-tw-btn', this, this.handleTwitterShare);
    this.setupEvent('click', '.picture-entry', this, this.handlePictureClick);

    //Check for querystring sent by a booking payment process
    preAuthorizationID = Utilities.getQueryStringParameterValue(window.location.search, 'preAuthorizationId');
    bookingID = Utilities.getQueryStringParameterValue(window.location.search, 'booking_id');
    if (paymentSuccessModalOpen === false && preAuthorizationID && bookingID && this.gear.data.subtype !== '' && App.user.data.id !== null) {
        App.router.openModalView('paymentsuccessful', {
            preAuthorizationID: preAuthorizationID,
            bookingID: bookingID,
            gear_id: this.gear.data.id,
            item_name: this.gear.data.brand + ' ' + this.gear.data.subtype + ' ' + this.gear.data.model,
            price_a: this.gear.data.price_a,
            price_b: this.gear.data.price_b,
            price_c: this.gear.data.price_c,
            currency: this.gear.data.currency,
        });
        paymentSuccessModalOpen = true;
    }

    window.mixpanel.track('View gearprofile');
};

GearProfile.prototype.renderAccessories = function() {
    var accessories = this.gear.data.accessories,
        i, html = '';

    if (accessories === null || accessories.length === 0) {
        html = 'This gear doesn\'t have any accessories.';
        $('#accessories-holder', this.$element).html(html);
        return;
    }

    html += 'This instrument is delivered with:<br><ul class="acclist">';
    for (i = 0; i < accessories.length; i++) {
        html += '<li>' + accessories[i] + '</li>';
    }
    html += '</ul>';
    $('#accessories-holder', this.$element).html(html);
};

GearProfile.prototype.renderOwnerPicture = function() {
    var view = this,
        img, isVertical, backgroundSize;
    if (!this.owner.data.image_url) {
        return;
    }
    img = new Image();
    img.onload = function() {
        isVertical = img.width < img.height;
        if (isVertical === true) {
            backgroundSize = '100% auto';
        } else {
            backgroundSize = 'auto 100%';
        }
        $('.profile-pic', view.$element).css({
            'background-image': 'url(' + img.src + ')',
            'background-size': backgroundSize
        });
    };
    img.alt = 'Sharingear user ' + this.owner.data.name;
    img.src = this.owner.data.image_url;
};

GearProfile.prototype.renderGearPictures = function() {
    var $owlContainer = $('.owl-carousel', this.$element),
        images = this.gear.data.images.split(','),
        html = '',
        i;

    for (i = 0; i < images.length; i++) {
        if (images[i].length > 0) {
            html += '<div class="item picture-entry"><img src="' + images[i] + '" alt="Thumb image of a ' + this.gear.data.brand + ' ' + this.gear.data.model + ' ' + this.gear.data.subtype + '" ></div>';
        }
    }
    $owlContainer.append(html);

    $owlContainer.owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true
    });
};

GearProfile.prototype.renderPricing = function() {
    var view = this;
    Localization.convertPrices([this.gear.data.price_a, this.gear.data.price_b, this.gear.data.price_c], this.gear.data.currency, App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.error('Could not convert prices: ' + error);
            return;
        }
        $('#gearprofile-displayed_price_a', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#gearprofile-displayed_price_b', view.$element).html(Math.ceil(convertedPrices[1]));
        $('#gearprofile-displayed_price_c', view.$element).html(Math.ceil(convertedPrices[2]));
    });
};

GearProfile.prototype.renderMap = function() {
    var view = this,
        gear = this.gear.data,
        mapOptions, latlong, marker;

    if (GoogleMaps.isLoaded() === false) {
        setTimeout(function() {
            view.renderMap();
        }, 10);
        return;
    }

    if (gear.latitude !== null && gear.longitude !== null) {
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

GearProfile.prototype.handleBooking = function(event) {
    var view = event.data,
        user = App.user;
    if (user.data.id === null) {
        user.login(function(error) {
            if (!error) {
                view.initialize();
                view.render();
                App.rootVC.header.render();
            } else {
                alert('You need to be logged in, in order to book an instrument.');
            }
        });
    } else {
        view.gear.getAvailability(App.user.data.id, function(error, result) {
            var passedData;
            if (error) {
                console.error(error);
                alert('Error checking gear availability.');
                if(error.code === Config.ERR_AUTH) {
                    alert('Your login session expired.');
                    App.router.navigateTo('home');
                }
                return;
            }
            passedData = {
                gear_id: view.gear.data.id,
                item_name: view.gear.data.brand + ' ' + view.gear.data.subtype + ' ' + view.gear.data.model,
                price_a: view.gear.data.price_a,
                price_b: view.gear.data.price_b,
                price_c: view.gear.data.price_c,
                currency: view.gear.data.currency,
                availability: result.availabilityArray,
                alwaysFlag: result.alwaysFlag,
                owner: view.owner
            };
            window.mixpanel.track('Book gear');
            App.router.openModalView('bookingrequest', passedData);
        });
    }
};

GearProfile.prototype.handleEditProfile = function(event) {
    var view = event.data;
    App.router.openModalView('editgear', view.gear);
};

GearProfile.prototype.handleFacebookShare = function(event) {
    var view = event.data;
    var url, instrument, description;

    url = 'https://www.sharingear.com/#!gearprofile/' + view.gear.data.id;
    instrument = view.gear.data.brand;
    description = 'Check out this ' + instrument + ' on Sharingear!' + url;

    FB.ui({
        method: 'feed',
        caption: 'www.sharingear.com',
        link: url,
        description: description
    });
};

GearProfile.prototype.handlePictureClick = function(event) {
    var view = event.data,
        pictureURL = $(this).children('img').attr('src'),
        imagePopup = new ImagePopup();

    imagePopup.initialize();
    imagePopup.show();
    imagePopup.setImage(pictureURL, 'A ' + view.templateParameters.brand + ' ' + view.templateParameters.model + ' ' + view.templateParameters.subtype);
};

GearProfile.prototype.handleTwitterShare = function(event) {
    var view = event.data,
        twtTitle = 'Check out this ' + view.gear.data.brand + ' on www.sharingear.com',
        twtUrl = 'https://www.sharingear.com/#!gearprofile/' + view.gear.data.id,
        maxLength = 140 - (twtUrl.length + 1),
        twtLink;

    twtTitle = twtTitle.length > maxLength ? twtTitle.substr(0, (maxLength - 3)) + '...' : twtTitle;
    twtLink = '//twitter.com/home?status=' + encodeURIComponent(twtTitle + ' ' + twtUrl);

    window.open(twtLink);
};

GearProfile.prototype.renderActionButton = function() {
    var view = this;

    $('.button-container button', view.$element).each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            $this.addClass('hidden');
        }
    });

    if (App.user.data.id === null) {
        $('#gearprofile-action-book', view.$element).removeClass('hidden');
        return;
    }

    if (App.user.data.id == view.gear.data.owner_id) {
        $('#gearprofile-action-edit', view.$element).removeClass('hidden');
        return;
    }

    if (view.availability !== null) {
        if (view.availability.alwaysFlag === 1 || view.availability.availabilityArray.length > 0) {
            $('#gearprofile-action-book', view.$element).removeClass('hidden');
        } else {
            $('#gearprofile-action-unavailable', view.$element).removeClass('hidden');
        }
    }
};

module.exports = GearProfile;
