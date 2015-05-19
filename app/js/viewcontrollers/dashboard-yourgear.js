/**
 * Controller for the Sharingear Your gear dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    GearList = require('../models/gearlist.js'),

    gearBlockID = 'yourgear-gear-block';

function DashboardYourGear(options) {
    ViewController.call(this, options);
}

DashboardYourGear.prototype = new ViewController();

DashboardYourGear.prototype.didInitialize = function() {
    var view = this;
    view.gearList = new GearList({
        rootURL: Config.API_URL
    });
    view.gearList.initialize();
    view.gearList.getUserGear(App.user.data.id, function() {
        view.render();
    });

    this.setTitle('Sharingear Dashboard - Your gear');
    this.setDescription('An overview of all your gear listed on Sharingear.');
};

DashboardYourGear.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Your gear');
    }

    if (this.gearList.data.length > 0) {
        this.populateYourGear();
    } else {
        $('#' + gearBlockID, this.$element).append('You haven\'t listed any gear yet!');
    }

    this.setupEvent('click', '#dashboard-yourgear-add-btn', this, this.handleAddGear);
    this.setupEvent('click', '.yourgear-item-edit-btn', this, this.handleEditGearItem);
};

DashboardYourGear.prototype.populateYourGear = function(callback) {
    var view = this,
        handleImageLoad, YourGearItemTemplate;

    YourGearItemTemplate = require('../../templates/yourgear-item.html');
    var yourGearItemTemplate = _.template(YourGearItemTemplate),
        yourGear = view.gearList.data,
        $gearBlock, defaultGear, gear, i, $gearItem;

    $gearBlock = $('#' + gearBlockID, view.$element);

    handleImageLoad = function() {
        if (this.width < this.height) {
            $('.gear-item-' + this.resultNum).addClass('search-result-gear-vertical');
        } else {
            $('.gear-item-' + this.resultNum).addClass('search-result-gear-horizontal');
        }
    };

    for (i = 0; i < yourGear.length; i++) {
        defaultGear = {
            id: null,
            gear_type: '',
            subtype: '',
            brand: '',
            model: '',
            description: '',
            img_url: 'images/placeholder_grey.png',
            price_a: 0,
            price_b: 0,
            price_c: 0,
            owner_id: null,
            gear_status: 'unavailable'
        };

        gear = yourGear[i];
        _.extend(defaultGear, gear.data);
        if (defaultGear.images.length > 0) {
            defaultGear.img_url = defaultGear.images.split(',')[0];
        }

        $gearItem = $(yourGearItemTemplate(defaultGear));

        //Add unique class for every image
        $('.sg-bg-image', $gearItem).addClass('gear-item-' + i);

        // Create an image object
        var img = new Image();
        img.resultNum = i;

        //Get thumbURL from the imageURL
        var thumbURL, imgName, imgNameComponents, imgExt, imageURL;
        imageURL = defaultGear.img_url;

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

        //Assign the img source to the the thumbURL
        $('.sg-bg-image', $gearItem).css({
            'background-image': 'url("' + thumbURL + '")'
        });
        img.src = thumbURL;

        //Make the pictures fit the boxes
        img.onload = handleImageLoad;

        $gearBlock.append($gearItem);
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
};

DashboardYourGear.prototype.handleAddGear = function() {
    App.router.openModalView('addgear');
};

DashboardYourGear.prototype.handleEditGearItem = function(event) {
    var view = event.data,
        gear;
    gear = view.gearList.getGearItem('id', $(this).data('yourgearid'));
    App.router.openModalView('editgear', gear);
};

module.exports = DashboardYourGear;
