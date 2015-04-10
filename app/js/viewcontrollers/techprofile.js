/**
 * Controller for the Sharingear Technician profile page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    GoogleMaps = require('../libraries/mscl-googlemaps.js'),
    FB = require('../libraries/mscl-facebook.js'),

    Config = require('../config.js'),
    Utilities = require('../utilities.js'),
    App = require('../app.js'),
    ViewController = require('../viewcontroller.js'),

    Localization = require('../models/localization.js'),
    User = require('../models/user.js'),
    TechProfileModel = require('../models/techprofile.js'),

    paymentSuccessModalOpen = false;

function TechProfile(options) {
    ViewController.call(this, options);
    this.hasSubviews = false;
    this.techProfile = null;
    this.owner = null;
    this.map = null;
}

TechProfile.prototype = new ViewController();

TechProfile.prototype.didInitialize = function() {
    var view = this;

    Localization.getCurrentTimeZone();

    view.templateParameters = {
        roadie_type: '',
        icon: '',
        displayed_price_a: '',
        displayed_price_b: '',
        displayed_price_c: '',
        currency: App.user.data.currency,
        experience: '',
        about: '',
        currently: '',
        tours: '',
        companies: '',
        xp_years: '',
        genres: '',
        bands: '',
        name: '',
        location: '',
        owner_id: ''
    };

    view.owner = new User({
        rootURL: Config.API_URL
    });
    view.owner.initialize();

    view.availability = null;

    if (view.passedData) {
        //No need to fetch tech profile from backend
        view.techProfile = this.passedData;
        view.render();
    } else {
        if (view.techProfile === null) {
            //In this case the view is loaded the first time, and not returning from a modal fx
            view.techProfile = new TechProfileModel({
                rootURL: Config.API_URL
            });
            view.techProfile.initialize();
            view.techProfile.data.id = view.subPath;
            view.subPath = ''; //To avoid rendering a subview based on the gear id
        }

        view.techProfile.update(App.user.data.id, function(error) {
            var publicInfoDeferred = $.Deferred(), 
                availabilityDeferred = $.Deferred();

            if (error) {
                console.log(error);
                return;
            }

            view.owner.data.id = view.techProfile.data.owner_id;
            view.owner.getPublicInfo(function(error) {
                var techProfileData, ownerData;
                if (error) {
                    console.log(error);
                    return;
                }
                techProfileData = view.techProfile.data;
                ownerData = view.owner.data;
                _.extend(view.templateParameters, {
                    roadie_type: techProfileData.roadie_type,
                    icon: techProfileData.roadie_type.replace(/\s/g, '').toLowerCase(),
                    experience: techProfileData.experience,
                    about: techProfileData.about,
                    currently: techProfileData.currently,
                    tours: techProfileData.tours,
                    companies: techProfileData.companies,
                    xp_years: techProfileData.xp_years,
                    genres: techProfileData.genres,
                    bands: techProfileData.bands,
                    currency: App.user.data.currency,
                    name: ownerData.name + ' ' + ownerData.surname.substring(0, 1) + '.',
                    location: techProfileData.city + ', ' + techProfileData.country,
                    owner_id: techProfileData.owner_id
                });
                publicInfoDeferred.resolve();
            });

            view.techProfile.getAvailability(function(error, result) {
                if (error) {
                    console.log('Error getting tech profile availability: ' + error);
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

TechProfile.prototype.didRender = function() {
    var preAuthorizationID, bookingID;

    if (App.rootVC.header) {
        App.rootVC.header.setTitle(this.techProfile.data.roadie_type);
    }

    this.renderPricing();
    this.renderOwnerPicture();
    this.renderMap();

    this.renderActionButton();
    this.renderTechProfileList();

    this.setupEvent('click', '#techprofile-action-book', this, this.handleBooking);
    this.setupEvent('click', '#techprofile-action-edit', this, this.handleEditProfile);
    this.setupEvent('click', '#techprofile-fb-btn', this, this.handleFacebookShare);
    this.setupEvent('click', '#techprofile-tw-btn', this, this.handleTwitterShare);


    //Check for querystring sent by a booking payment process
    preAuthorizationID = Utilities.getQueryStringParameterValue(window.location.search, 'preAuthorizationId');
    bookingID = Utilities.getQueryStringParameterValue(window.location.search, 'booking_id');
    if (paymentSuccessModalOpen === false && preAuthorizationID && bookingID && this.techProfile.data.roadie_type !== '' && App.user.data.id !== null) {
        App.router.openModalView('paymentsuccessful', {
            preAuthorizationID: preAuthorizationID,
            bookingID: bookingID,
            techprofile_id: this.techProfile.data.id,
            item_name: this.techProfile.data.roadie_type,
            price_a: this.techProfile.data.price_a,
            price_b: this.techProfile.data.price_b,
            price_c: this.techProfile.data.price_c,
            currency: this.techProfile.data.currency,
        });
        paymentSuccessModalOpen = true;
    }
};

TechProfile.prototype.renderOwnerPicture = function() {
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
    img.src = this.owner.data.image_url;
};

TechProfile.prototype.renderPricing = function() {
    var view = this;
    Localization.convertPrices([this.techProfile.data.price_a, this.techProfile.data.price_b, this.techProfile.data.price_c], this.techProfile.data.currency, App.user.data.currency, function(error, convertedPrices) {
        if (error) {
            console.log('Could not convert prices: ' + error);
            return;
        }
        $('#techprofile-displayed_price_a', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#techprofile-displayed_price_b', view.$element).html(Math.ceil(convertedPrices[0]));
        $('#techprofile-displayed_price_c', view.$element).html(Math.ceil(convertedPrices[0]));
    });
};

TechProfile.prototype.renderMap = function() {
    var techProfile = this.techProfile.data,
        mapOptions, latlong, marker;
    if (techProfile.latitude !== null && techProfile.longitude !== null) {
        latlong = new GoogleMaps.LatLng(techProfile.latitude, techProfile.longitude);
        mapOptions = {
            center: latlong,
            zoom: 14,
            maxZoom: 14
        };
        this.map = new GoogleMaps.Map(document.getElementById('techprofile-map'), mapOptions);
        marker = new GoogleMaps.Marker({
            position: latlong,
            map: this.map,
            icon: 'images/map_pin.png' // TODO: put icon on server
        });
    }
};

TechProfile.prototype.handleBooking = function(event) {
    var view = event.data,
        user = App.user;
    if (user.data.id === null) {
        user.login(function(error) {
            if (!error) {
                view.initialize();
                view.render();
                App.rootVC.header.render();
            } else {
                alert('You need to be logged in, in order to hire a technician.');
            }
        });
    } else {
        view.techProfile.getAvailability(function(error, result) {
            var passedData;
            if (error) {
                console.log(error);
                alert('Error checking tech profile availability.');
                return;
            }
            passedData = {
                techprofile_id: view.techProfile.data.id,
                item_name: view.owner.data.name + ' ' + view.owner.data.surname + ', ' + view.techProfile.data.roadie_type,
                price_a: view.techProfile.data.price_a,
                price_b: view.techProfile.data.price_b,
                price_c: view.techProfile.data.price_c,
                currency: view.techProfile.data.currency,
                availability: result.availabilityArray,
                alwaysFlag: result.alwaysFlag,
                owner: view.owner
            };
            App.router.openModalView('bookingrequest', passedData);
        });
    }
};

TechProfile.prototype.handleEditProfile = function(event) {
    var view = event.data;
    App.router.openModalView('edittechprofile', view.techProfile);
};

TechProfile.prototype.handleFacebookShare = function(event) {
    var view = event.data;
    var url, description;

    url = 'https://www.sharingear.com/#techprofile/' + view.techProfile.data.id;
    description = 'Check out this ' + view.techProfile.data.roadie_type + ' on Sharingear!' + url;

    FB.ui({
        method: 'feed',
        caption: 'www.sharingear.com',
        link: url,
        description: description
    });
};

TechProfile.prototype.handleTwitterShare = function(event) {
    var view = event.data,
        twtTitle = 'Check out this ' + view.techProfile.data.roadie_type + ' on www.sharingear.com',
        twtUrl = 'https://www.sharingear.com/#techprofile/' + view.techProfile.data.id,
        maxLength = 140 - (twtUrl.length + 1),
        twtLink;

    twtTitle = twtTitle.length > maxLength ? twtTitle.substr(0, (maxLength - 3)) + '...' : twtTitle;
    twtLink = '//twitter.com/home?status=' + encodeURIComponent(twtTitle + ' ' + twtUrl);

    window.open(twtLink);
};

TechProfile.prototype.renderTechProfileList = function() {
    var techProfile = this.techProfile.data,
        view = this,
        container = $('#techprofilelist', view.$element);

    if (techProfile.techprofilelist !== null && techProfile.techprofilelist.length > 0) {
        container.html('');
        techProfile.techprofilelist.forEach(function(entry) {
            container.html(function(_, html) {
                return html + '<a href="#techprofile/' + entry.id + '">' + entry.roadie_type + '</a>  ';
            });
        });
    }

};

TechProfile.prototype.renderActionButton = function() {
    var view = this;

    $('.button-container button', view.$element).each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            $this.addClass('hidden');
        }
    });

    if (App.user.data.id === null) {
        $('#techprofile-action-book', view.$element).removeClass('hidden');
        return;
    }

    if (App.user.data.id == view.techProfile.data.owner_id) {
        $('#techprofile-action-edit', view.$element).removeClass('hidden');
        return;
    }

    if (view.availability !== null) {
        if (view.availability.alwaysFlag === 1 || view.availability.availabilityArray.length > 0) {
            $('#techprofile-action-book', view.$element).removeClass('hidden');
        } else {
            $('#techprofile-action-unavailable', view.$element).removeClass('hidden');
        }
    }
};

module.exports = TechProfile;
