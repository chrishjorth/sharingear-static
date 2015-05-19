/**
 * Controller for the Sharingear Your vans dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    VanList = require('../models/vanlist.js'),

    vanBlockID = 'yourvans-vans-block';

function DashboardYourVans(options) {
    ViewController.call(this, options);
}

DashboardYourVans.prototype = new ViewController();

DashboardYourVans.prototype.didInitialize = function() {
    var view = this;
    view.vanList = new VanList({
        rootURL: Config.API_URL
    });
    view.vanList.initialize();
    view.vanList.getUserVans(App.user.data.id, function() {
        view.render();
    });

    this.setTitle('Sharingear Dashboard - Your vans');
    this.setDescription('An overview of all your vans listed on Sharingear.');
};

DashboardYourVans.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Your vans');
    }

    if (this.vanList.data.length > 0) {
        this.populateYourVans();
    } else {
        $('#' + vanBlockID, this.$element).append('You haven\'t listed any vans yet!');
    }

    this.setupEvent('click', '#dashboard-yourvans-add-btn', this, this.handleAddVan);
    this.setupEvent('click', '.yourvan-item-edit-btn', this, this.handleEditVanItem);
};

DashboardYourVans.prototype.populateYourVans = function(callback) {
    var view = this,
        YourVansItemTemplate, handleImageLoad;

    YourVansItemTemplate = require('../../templates/yourvans-item.html');

    var yourVansItemTemplate = _.template(YourVansItemTemplate),
        yourVans = view.vanList.data,
        $vanBlock, defaultVan, van, i, $vanItem;

    handleImageLoad = function() {
        if (this.width < this.height) {
            $('.van-item-' + this.resultNum).addClass('search-result-gear-vertical');
        } else {
            $('.van-item-' + this.resultNum).addClass('search-result-gear-horizontal');
        }
    };

    $vanBlock = $('#' + vanBlockID, view.$element);

    for (i = 0; i < yourVans.length; i++) {
        defaultVan = {
            id: null,
            van_type: '',
            model: '',
            description: '',
            img_url: 'images/placeholder_grey.png',
            price_a: 0,
            price_b: 0,
            price_c: 0,
            owner_id: null
        };

        van = yourVans[i];
        _.extend(defaultVan, van.data);
        if (defaultVan.images.length > 0) {
            defaultVan.img_url = defaultVan.images.split(',')[0];
        }
        $vanItem = $(yourVansItemTemplate(defaultVan));

        //Add unique class for every image
        $('.sg-bg-image', $vanItem).addClass('van-item-' + i);

        // Create an image object
        var img = new Image();
        img.resultNum = i;

        //Get thumbURL from the imageURL
        var thumbURL, imgName, imgNameComponents, imgExt, imageURL;
        imageURL = defaultVan.img_url;

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
        $('.sg-bg-image', $vanItem).css({
            'background-image': 'url("' + thumbURL + '")'
        });

        img.src = thumbURL;

        //Make the pictures fit the boxes
        img.onload = handleImageLoad;

        $vanBlock.append($vanItem);
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
};

DashboardYourVans.prototype.handleAddVan = function() {
    App.router.openModalView('addvan');
};

DashboardYourVans.prototype.handleEditVanItem = function(event) {
    var view = event.data,
        van;
    van = view.vanList.getVanItem('id', $(this).data('yourvanid'));
    App.router.openModalView('editvan', van);
};

module.exports = DashboardYourVans;
