/**
 * Controller for the Sharingear Van profile page view.
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
    User = require('../models/user.js'),
    Van = require('../models/van.js'),
    ImagePopup = require('../popups/imagepopup.js'),

    paymentSuccessModalOpen = false;

function VanProfile(options) {
    ViewController.call(this, options);
    this.hasSubviews = false;
    this.van = null;
    this.owner = null;
    this.map = null;
}

VanProfile.prototype = new ViewController();

VanProfile.prototype.didInitialize = function() {
    var view = this,
        subPathComponents;

    Localization.getCurrentTimeZone();

    view.templateParameters = {
        van_type: '',
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
        //No need to fetch van from backend
        view.van = this.passedData;
        view.render();
    } else {
        if (view.van === null) {
            //In this case the view is loaded the first time, and not returning from a modal fx
            view.van = new Van({
                rootURL: Config.API_URL
            });
            view.van.initialize();
            subPathComponents = view.subPath.split('/');
            view.van.data.id = subPathComponents[0];
            view.subPath = ''; //To avoid rendering a subview based on the gear id
        } else {
            view.van.initialize();
        }

        view.van.update(App.user.data.id, function(error) {
            var publicInfoDeferred = $.Deferred(),
                availabilityDeferred = $.Deferred();
            if (error) {
                console.error(error);
                return;
            }
            view.owner.data.id = view.van.data.owner_id;
            view.owner.getPublicInfo(function(error) {
                var vanData, ownerData;
                if (error) {
                    console.error(error);
                    return;
                }
                vanData = view.van.data;
                ownerData = view.owner.data;
                _.extend(view.templateParameters, {
                    van_type: vanData.van_type,
                    model: vanData.model,
                    description: vanData.description,
                    accessories: vanData.accessories,
                    currency: App.user.data.currency,
                    name: ownerData.name + ' ' + ownerData.surname.substring(0, 1) + '.',
                    bio: ownerData.bio,
                    location: vanData.city + ', ' + vanData.country,
                    owner_id: vanData.owner_id
                });
                publicInfoDeferred.resolve();
                view.setTitle('Sharingear - ' + vanData.van_type + ' ' + vanData.model);
                view.setDescription(vanData.description);
            });

            view.van.getAvailability(function(error, result) {
                if (error) {
                    console.error('Error getting van availability: ' + error);
                    if (error.code === Config.ERR_AUTH) {
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

VanProfile.prototype.didRender = function() {
    var preAuthorizationID, bookingID;

    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle(this.van.data.van_type);
        App.rootVC.header.enableBackButton();
    }

    this.renderPricing();
    this.renderVanPictures();
    this.renderOwnerPicture();
    this.renderAccessories();
    this.renderMap();

    this.renderActionButton();

    this.setupEvent('click', '#vanprofile-action-book', this, this.handleBooking);
    this.setupEvent('click', '#vanprofile-action-edit', this, this.handleEditProfile);
    this.setupEvent('click', '#vanprofile-fb-btn', this, this.handleFacebookShare);
    this.setupEvent('click', '#vanprofile-tw-btn', this, this.handleTwitterShare);
    this.setupEvent('click', '.picture-entry', this, this.handlePictureClick);

    //Check for querystring sent by a booking payment process
    preAuthorizationID = Utilities.getQueryStringParameterValue(window.location.search, 'preAuthorizationId');
    bookingID = Utilities.getQueryStringParameterValue(window.location.search, 'booking_id');
    if (paymentSuccessModalOpen === false && preAuthorizationID && bookingID && this.van.data.van_type !== '' && App.user.data.id !== null) {
        App.router.openModalView('paymentsuccessful', {
            preAuthorizationID: preAuthorizationID,
            bookingID: bookingID,
            van_id: this.van.data.id,
            item_name: this.van.data.van_type + ' ' + this.van.data.model,
            price_a: this.van.data.price_a,
            price_b: this.van.data.price_b,
            price_c: this.van.data.price_c,
            currency: this.van.data.currency,
        });
        paymentSuccessModalOpen = true;
    }

    window.mixpanel.track('View vanprofile');
};

VanProfile.prototype.renderAccessories = function() {
    var accessories = this.van.data.accessories,
        i, html = '';

    if (accessories === null || accessories.length === 0) {
        html = 'This van doesn\'t have any accessories.';
        $('#accessories-holder', this.$element).html(html);
        return;
    }

    html += 'This vehicle is delivered with:<br><ul class="acclist">';
    for (i = 0; i < accessories.length; i++) {
        html += '<li>' + accessories[i] + '</li>';
    }
    html += '</ul>';
    $('#accessories-holder', this.$element).html(html);
};

VanProfile.prototype.renderOwnerPicture = function() {
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

VanProfile.prototype.renderVanPictures = function() {
    var $owlContainer = $('.owl-carousel', this.$element),
        images = this.van.data.images.split(','),
        html = '',
        i;

    for (i = 0; i < images.length; i++) {
        if (images[i].length > 0) {
            html += '<div class="item picture-entry"><img src="' + images[i] + '" alt="Thumb image for ' + this.van.data.van_type + ' ' + this.van.data.model + '" ></div>';
        }
    }
    $owlContainer.append(html);

    $owlContainer.owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true
    });
};

VanProfile.prototype.renderPricing = function() {
    var view = this;
    Localization.convertPrices([this.van.data.price_a, this.van.data.price_b, this.van.data.price_c], this.van.data.currency, App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.error('Could not convert prices: ' + error);
            return;
        }
        $('#vanprofile-displayed_price_a', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#vanprofile-displayed_price_b', view.$element).html(Math.ceil(convertedPrices[1]));
        $('#vanprofile-displayed_price_c', view.$element).html(Math.ceil(convertedPrices[2]));
    });
};

VanProfile.prototype.renderMap = function() {
    var view = this,
        van = this.van.data,
        mapOptions, latlong, marker;

    if (GoogleMaps.isLoaded() === false) {
        setTimeout(function() {
            view.renderMap();
        }, 10);
        return;
    }

    if (van.latitude !== null && van.longitude !== null) {
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

VanProfile.prototype.handleBooking = function(event) {
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
        view.van.getAvailability(function(error, result) {
            var passedData;
            if (error) {
                console.error(error);
                alert('Error checking van availability.');
                if (error.code === Config.ERR_AUTH) {
                    alert('Your login session expired.');
                    App.router.navigateTo('home');
                }
                return;
            }
            passedData = {
                van_id: view.van.data.id,
                item_name: view.van.data.van_type + ' ' + view.van.data.model,
                price_a: view.van.data.price_a,
                price_b: view.van.data.price_b,
                price_c: view.van.data.price_c,
                currency: view.van.data.currency,
                availability: result.availabilityArray,
                alwaysFlag: result.alwaysFlag,
                owner: view.owner
            };
            window.mixpanel.track('Book van');
            App.router.openModalView('bookingrequest', passedData);
        });
    }
};

VanProfile.prototype.handleEditProfile = function(event) {
    var view = event.data;
    App.router.openModalView('editvan', view.van);
};

VanProfile.prototype.handlePictureClick = function(event) {
    var view = event.data,
        pictureURL = $(this).children('img').attr('src'),
        imagePopup = new ImagePopup();

    imagePopup.initialize();
    imagePopup.show();
    imagePopup.setImage(pictureURL, 'A ' + view.templateParameters.van_type + ' ' + view.templateParameters.model);
};

VanProfile.prototype.handleFacebookShare = function(event) {
    var view = event.data;
    var url, description;

    url = 'https://www.sharingear.com/#!vanprofile/' + view.van.data.id;
    description = 'Check out this ' + view.van.data.van_type + ' on Sharingear!' + url;

    FB.ui({
        method: 'feed',
        caption: 'www.sharingear.com',
        link: url,
        description: description
    });
};

VanProfile.prototype.handleTwitterShare = function(event) {
    var view = event.data,
        twtTitle = 'Check out this ' + view.van.data.van_type + ' on www.sharingear.com',
        twtUrl = 'https://www.sharingear.com/#!vanprofile/' + view.van.data.id,
        maxLength = 140 - (twtUrl.length + 1),
        twtLink;

    twtTitle = twtTitle.length > maxLength ? twtTitle.substr(0, (maxLength - 3)) + '...' : twtTitle;
    twtLink = '//twitter.com/home?status=' + encodeURIComponent(twtTitle + ' ' + twtUrl);

    window.open(twtLink);
};

VanProfile.prototype.renderActionButton = function() {
    var view = this;

    $('.button-container button', view.$element).each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            $this.addClass('hidden');
        }
    });

    if (App.user.data.id === null) {
        $('#vanprofile-action-book', view.$element).removeClass('hidden');
        return;
    }

    if (App.user.data.id == view.van.data.owner_id) {
        $('#vanprofile-action-edit', view.$element).removeClass('hidden');
        return;
    }

    if (view.availability !== null) {
        if (view.availability.alwaysFlag === 1 || view.availability.availabilityArray.length > 0) {
            $('#vanprofile-action-book', view.$element).removeClass('hidden');
        } else {
            $('#vanprofile-action-unavailable', view.$element).removeClass('hidden');
        }
    }
};

module.exports = VanProfile;
