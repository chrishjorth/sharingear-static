/**
 * Controller for the Sharingear Search view.
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
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    Localization = require('../models/localization.js'),
    GearList = require('../models/gearlist.js'),
    TechProfileList = require('../models/techprofilelist.js'),
    VanList = require('../models/vanlist.js'),

    gearSearchBlockID = 'search-results-gear',
    techProfileSearchBlockID = 'search-results-techprofiles',
    vanSearchBlockID = 'search-results-vans';

function Search(options) {
    ViewController.call(this, options);
}

Search.prototype = new ViewController();

Search.prototype.didInitialize = function() {
    this.gearSearchFormVC = null;
    this.techProfileSearchFormVC = null;
    this.vanSearchFormVC = null;

    this.gearList = new GearList({
        rootURL: Config.API_URL
    });
    this.gearList.initialize();

    this.techProfileList = new TechProfileList({
        rootURL: Config.API_URL
    });
    this.techProfileList.initialize();

    this.vanList = new VanList({
        rootURL: Config.API_URL
    });
    this.vanList.initialize();

    this.latitude = 0.0;
    this.longitude = 0.0;

    this.setTitle('Sharingear - Search');
    this.setDescription('Search for gear, transportation and technicians for your live event or tour.');
};

Search.prototype.didRender = function() {
    var queryString;

    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Search gear');
    }

    //Figure out current tab
    queryString = Utilities.getQueryString();
    if (queryString) {
        if (queryString.indexOf('van') >= 0) {
            this.switchToTab($('#search-tab-vans', this.$element));
        } else if (queryString.indexOf('techprofile') >= 0) {
            this.switchToTab($('#search-tab-technicians', this.$element));
        } else {
            //Set to gear search
            this.switchToTab($('#search-tab-gear', this.$element));
        }
    } else {
        //Set to gear search
        this.switchToTab($('#search-tab-gear', this.$element));
    }

    this.setupEvent('click', '.sg-tabs .sg-btn-invisible', this, this.handleTab);
    this.setupEvent('click', '.fb-share-btn', this, this.handleFBShare);
};

Search.prototype.renderMap = function(searchResults, latitude, longitude) {
    var view = this,
        mapOptions, latlong, i, gear;

    if (GoogleMaps.isLoaded() === false) {
        setTimeout(function() {
            view.renderMap(searchResults, latitude, longitude);
        }, 10);
        return;
    }

    if (!latitude || !longitude) {
        latlong = new GoogleMaps.LatLng(40.746227, 14.656527);
        mapOptions = {
            center: latlong,
            zoom: 2,
            maxZoom: 14
        };
    } else {
        latlong = new GoogleMaps.LatLng(latitude, longitude);
        mapOptions = {
            center: latlong,
            zoom: 12,
            maxZoom: 14
        };
    }

    //draw map
    this.map = new GoogleMaps.Map(document.getElementById('search-map'), mapOptions);

    //add markers based on search results
    for (i = 0; i < searchResults.length; i++) {
        gear = searchResults[i].data;
        latlong = new GoogleMaps.LatLng(gear.latitude, gear.longitude);
        searchResults[i].marker = new GoogleMaps.Marker({
            position: latlong,
            map: this.map,
            icon: 'images/map_pin.png'
        });
    }
};

Search.prototype.setCurrentLocation = function(location) {
    var tab = this.getCurrentTab();
    if (location === 'all' || location === '') {
        location = 'the world';
    }
    if (tab === 'vans') {
        $('#search-currentlocation', this.$element).html('Showing vehicles around ' + location);
    } else if (tab === 'technicians') {
        $('#search-currentlocation', this.$element).html('Showing technicians around ' + location);
    } else {
        $('#search-currentlocation', this.$element).html('Showing gear around ' + location);
    }
};

Search.prototype.handleTab = function(event) {
    var view = event.data;
    view.switchToTab($(this));
};

Search.prototype.handleFBShare = function(event) {
    var view = event.data,
        tab, item, searchParameters, description;

    tab = view.getCurrentTab();
    
    switch (tab) {
        case 'gear':
            searchParameters = view.gearSearchFormVC.getSearchParameters;
            item = searchParameters.gearString;
            break;
        case 'vans':
            searchParameters = view.vanSearchFormVC.getSearchParameters;
            item = searchParameters.vanString;
            break;
        case 'technicians':
            searchParameters = view.techProfileSearchFormVC.getSearchParameters;
            item = searchParameters.techProfileString;
            break;
    }
    
    description = 'Hey, I am looking for a ' + item + ' near ' + searchParameters.locationString + ' - anyone? Help me out at www.sharingear.com, because I am willing to rent it from you!';

    FB.ui({
        method: 'feed',
        caption: 'Request ' + tab + ' on Sharingear!',
        link: 'sharingear.com',
        description: description
    }, function() {});
};

Search.prototype.handleLogin = function() {
    App.user.login(function(error) {
        if (!error) {
            App.router.navigateTo('dashboard');
            App.rootVC.header.render();
            return;
        }
        console.error(error);
    });
};

Search.prototype.performGearSearch = function() {
    var view = this,
        performSearch, searchParameters, gearSearchVC, gearSearchVT;

    performSearch = function(gear, location, dateRange) {
        var geocoder;
        if (GoogleMaps.isLoaded() === false) {
            setTimeout(function() {
                performSearch(gear, location, dateRange);
            }, 10);
            return;
        }
        geocoder = new GoogleMaps.Geocoder();
        App.user.setSearchInterval(dateRange);
        if (location === '' || location === 'all' || location === null) {
            location = 'all';
            view.gearList.search(location, gear, dateRange, function(searchResults) {
                view.populateSearchBlock(searchResults, $('#' + gearSearchBlockID, view.$element));
                view.renderMap(searchResults);
                view.setCurrentLocation(location);
            });
        } else {
            geocoder.geocode({
                address: location
            }, function(results, status) {
                var locationData;
                if (status === GoogleMaps.GeocoderStatus.OK) {
                    locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
                    view.gearList.search(locationData, gear, dateRange, function(searchResults) {
                        view.populateSearchBlock(searchResults, $('#' + gearSearchBlockID, view.$element));
                        view.renderMap(searchResults, results[0].geometry.location.lat(), results[0].geometry.location.lng());
                        view.setCurrentLocation(results[0].formatted_address);
                    });
                } else {
                    console.error('Error geocoding: ' + status);
                    alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
                    view.populateSearchBlock([], $('#' + gearSearchBlockID, view.$element));
                    view.renderMap([]);
                    view.setCurrentLocation(location);
                }
            });
        }
    };

    gearSearchVC = require('./gearsearchform.js');
    gearSearchVT = require('../../templates/gearsearchform.html');

    view.gearSearchFormVC = new gearSearchVC({
        name: 'gearsearchform',
        $element: $('#search-searchform-gear .searchform-container', view.$element),
        template: gearSearchVT
    });
    view.gearSearchFormVC.initialize();
    view.gearSearchFormVC.render();
    searchParameters = view.gearSearchFormVC.getSearchParameters();
    performSearch(searchParameters.gearString, searchParameters.locationString, searchParameters.dateRangeString);
};

Search.prototype.performTechProfileSearch = function() {
    var view = this,
        performSearch, searchParameters, techProfileSearchVC, techProfileSearchVT;

    performSearch = function(techProfile, location, dateRange) {
        var geocoder;
        if (GoogleMaps.isLoaded() === false) {
            setTimeout(function() {
                performSearch(techProfile, location, dateRange);
            }, 10);
            return;
        }
        geocoder = new GoogleMaps.Geocoder();
        App.user.setSearchInterval(dateRange);
        if (location === '' || location === 'all' || location === null) {
            location = 'all';
            view.techProfileList.search(location, techProfile, dateRange, function(searchResults) {
                view.populateSearchBlock(searchResults, $('#' + techProfileSearchBlockID, view.$element));
                view.renderMap(searchResults);
                view.setCurrentLocation(location);
            });
        } else {
            geocoder.geocode({
                address: location
            }, function(results, status) {
                var locationData;
                if (status === GoogleMaps.GeocoderStatus.OK) {
                    locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
                    view.techProfileList.search(locationData, techProfile, dateRange, function(searchResults) {
                        view.populateSearchBlock(searchResults, $('#' + techProfileSearchBlockID, view.$element));
                        view.renderMap(searchResults, results[0].geometry.location.lat(), results[0].geometry.location.lng());
                        view.setCurrentLocation(results[0].formatted_address);
                    });
                } else {
                    console.error('Error geocoding: ' + status);
                    alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
                    view.populateSearchBlock([], $('#' + techProfileSearchBlockID, view.$element));
                    view.renderMap([]);
                    view.setCurrentLocation(location);
                }
            });
        }
    };

    techProfileSearchVC = require('./techprofilesearchform.js');
    techProfileSearchVT = require('../../templates/techprofilesearchform.html');
    view.techProfileSearchFormVC = new techProfileSearchVC({
        name: 'techprofilesearchform',
        $element: $('#search-searchform-technicians .searchform-container', view.$element),
        template: techProfileSearchVT
    });
    view.techProfileSearchFormVC.initialize();
    view.techProfileSearchFormVC.render();
    searchParameters = view.techProfileSearchFormVC.getSearchParameters();
    performSearch(searchParameters.techProfileString, searchParameters.locationString, searchParameters.dateRangeString);
};

Search.prototype.performVanSearch = function() {
    var view = this,
        performSearch, searchParameters, vanSearchVC, vanSearchVT;

    performSearch = function(vans, location, dateRange) {
        var geocoder;
        if (GoogleMaps.isLoaded() === false) {
            setTimeout(function() {
                performSearch(vans, location, dateRange);
            }, 10);
            return;
        }
        geocoder = new GoogleMaps.Geocoder();
        App.user.setSearchInterval(dateRange);
        if (location === '' || location === 'all' || location === null) {
            location = 'all';
            view.vanList.search(location, vans, dateRange, function(searchResults) {
                view.populateSearchBlock(searchResults, $('#' + vanSearchBlockID, view.$element));
                view.renderMap(searchResults);
                view.setCurrentLocation(location);
            });
        } else {
            geocoder.geocode({
                address: location
            }, function(results, status) {
                var locationData;
                if (status === GoogleMaps.GeocoderStatus.OK) {
                    locationData = results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
                    view.vanList.search(locationData, vans, dateRange, function(searchResults) {
                        view.populateSearchBlock(searchResults, $('#' + vanSearchBlockID, view.$element));
                        view.renderMap(searchResults, results[0].geometry.location.lat(), results[0].geometry.location.lng());
                        view.setCurrentLocation(results[0].formatted_address);
                    });
                } else {
                    console.error('Error geocoding: ' + status);
                    alert('Couldn\'t find this location. You can use the keyword all, to get locationless results.');
                    view.populateSearchBlock([], $('#' + vanSearchBlockID, view.$element));
                    view.renderMap([]);
                    view.setCurrentLocation(location);
                }
            });
        }
    };

    vanSearchVC = require('./vansearchform.js');
    vanSearchVT = require('../../templates/vansearchform.html');
    view.vanSearchFormVC = new vanSearchVC({
        name: 'vansearchform',
        $element: $('#search-searchform-vans .searchform-container', view.$element),
        template: vanSearchVT
    });
    view.vanSearchFormVC.initialize();
    view.vanSearchFormVC.render();
    searchParameters = view.vanSearchFormVC.getSearchParameters();
    performSearch(searchParameters.vanString, searchParameters.locationString, searchParameters.dateRangeString);
};

Search.prototype.switchToTab = function($tabButton) {
    var id = $tabButton.attr('id'),
        tab;

    $('.sg-tabs li', this.$element).removeClass('active');
    $tabButton.parent().addClass('active');

    $('.sg-tab-panel', this.$element).each(function() {
        var $panel = $(this);
        if ($panel.hasClass('hidden') === false) {
            $panel.addClass('hidden');
        }
    });
    tab = id.substring(11); //11 is the length of 'search-tab-'
    $('#search-searchform-' + tab, this.$element).removeClass('hidden');

    switch (tab) {
        case 'gear':
            this.performGearSearch();
            break;
        case 'technicians':
            this.performTechProfileSearch();
            break;
        case 'vans':
            this.performVanSearch();
            break;
    }
};

Search.prototype.getCurrentTab = function() {
    var currentTabID = $('.sg-tabs .active .sg-btn-invisible', this.$element).attr('id'),
        currentTab = 'gear';
    if (currentTabID) {
        currentTab = currentTabID.substring(11); //11 is the length of 'search-tab-'
    }
    return currentTab;
};

/**
 * Generate the search results HTML and insert it into the search results block.
 * @param searchResults: an array of objects.
 */
Search.prototype.populateSearchBlock = function(searchResults, $searchBlock, callback) {
    var view = this,
        SearchResultTemplate;

    $('.searchresults, .no-results', view.$element).each(function() {
        var $this = $(this);
        if ($this.hasClass('hidden') === false) {
            $this.addClass('hidden');
        }
    });

    if (searchResults.length <= 0) {
        $('.no-results-' + view.getCurrentTab(), view.$element).removeClass('hidden');
        return;
    }

    $searchBlock.removeClass('hidden');
    $searchBlock.empty();

    SearchResultTemplate = require('../../templates/search-results.html');
    var searchResultTemplate = _.template(SearchResultTemplate),
        html = '',
        defaultSearchResults, workingSearchResults, handleImageLoad, handlePrices, tab, searchResult, i, img;

    defaultSearchResults = {
        id: 0,
        gear_type: 0,
        item_type: '',
        model: '',
        description: '',
        images: '',
        image: '',
        price: 0,
        currency: App.user.data.currency,
        city: '',
        address: '',
        price_a: 0,
        price_b: 0,
        price_c: 0,
        href: '',
        owner_id: null
    };

    handleImageLoad = function() {
        var $result = $('#search-results-' + this.resultNum, $searchBlock);
        $result.css('background-image', 'url("' + this.src + '")');

        if (this.width < this.height) {
            $result.addClass('search-result-gear-vertical');
        } else {
            $result.addClass('search-result-gear-horizontal');
        }

    };

    handlePrices = function(resultNum) {
        var $price = $('#search-results-' + resultNum + ' .price_a', $searchBlock);
        Localization.convertPrices([searchResults[resultNum].data.price_a], searchResults[resultNum].data.currency, App.user.data.currency, function(error, convertedPrice) {
            if (error) {
                console.error('Could not convert price: ' + error);
                return;
            }
            $price.html(Math.ceil(convertedPrice));
            $('.currency', $searchBlock).html(App.user.data.currency);
        });
    };

    tab = view.getCurrentTab();

    for (i = 0; i < searchResults.length; i++) {
        searchResult = searchResults[i].data;

        if (searchResult.images) {
            searchResult.image = searchResult.images.split(',')[0];
        }

        if (searchResult.image_url) {
            searchResult.image = searchResult.image_url;
        }

        if (searchResult.image === '' || !searchResult.image) {
            searchResult.image = 'images/placeholder_grey.png';
        }

        searchResult.resultNum = i;

        workingSearchResults = {};
        _.extend(workingSearchResults, defaultSearchResults, searchResult);
        if (tab === 'gear') {
            workingSearchResults.item_type = workingSearchResults.brand + ' ' + workingSearchResults.subtype;
            workingSearchResults.href = '#!gearprofile/' + workingSearchResults.id;
        } else if (tab === 'vans') {
            workingSearchResults.item_type = workingSearchResults.van_type;
            workingSearchResults.href = '#!vanprofile/' + workingSearchResults.id;
        } else {
            workingSearchResults.item_type = workingSearchResults.roadie_type;
            workingSearchResults.href = '#!techprofile/' + workingSearchResults.id;
        }
        html += searchResultTemplate(workingSearchResults);

        img = new Image();
        img.resultNum = i;
        if (tab === 'technicians') {
            img.src = searchResult.image;
        } else {
            img.src = view.getThumbURL(searchResult.image);
        }
        img.onload = handleImageLoad;
    }

    $searchBlock.append(html);

    //TODO: Optimize this to be included in previous loop, ie build search results in memory during loop.
    for (i = 0; i < searchResults.length; i++) {
        handlePrices(i);
    }

    if (callback && typeof callback === 'function') {
        callback();
    }
};

Search.prototype.getThumbURL = function(imageURL) {
    var thumbURL, imgName, imgNameComponents, imgExt;

    thumbURL = imageURL.split('/');
    imgName = thumbURL.pop();
    thumbURL = thumbURL.join('/');
    imgNameComponents = imgName.split('.');
    imgName = imgNameComponents[0];
    imgExt = imgNameComponents[1];
    if (window.window.devicePixelRatio > 1) {
        thumbURL = thumbURL + '/' + imgName + '_thumb@2x.' + imgExt;
    } else {
        thumbURL = thumbURL + '/' + imgName + '_thumb.' + imgExt;
    }
    return thumbURL;
};

module.exports = Search;
