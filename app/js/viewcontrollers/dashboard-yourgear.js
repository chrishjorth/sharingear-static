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

    gearBlockID,

    didInitialize,
    didRender,
    populateYourGear,

    handleAddGear,
    handleEditGearItem;

gearBlockID = 'yourgear-gear-block';

didInitialize = function() {
    var view = this;
    view.gearList = new GearList.constructor({
        rootURL: Config.API_URL
    });
    view.gearList.initialize();
    view.gearList.getUserGear(App.user.data.id, function() {
        view.render();
    });
};

didRender = function() {
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

populateYourGear = function(callback) {
    var view = this,
        YourGearItemTemplate;

    YourGearItemTemplate = require('../../templates/yourgear-item.html');
    var yourGearItemTemplate = _.template(YourGearItemTemplate),
        yourGear = view.gearList.data,
        $gearBlock, defaultGear, gear, i, $gearItem;

    $gearBlock = $('#' + gearBlockID, view.$element);

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
        $('.sg-bg-image', $gearItem).css({
            'background-image': 'url("' + defaultGear.img_url + '")'
        });
        $gearBlock.append($gearItem);
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
};

handleAddGear = function() {
    App.router.openModalView('addgear');
};

handleEditGearItem = function(event) {
    var view = event.data,
        gear;
    gear = view.gearList.getGearItem('id', $(this).data('yourgearid'));
    App.router.openModalView('editgear', gear);
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    populateYourGear: populateYourGear,

    handleAddGear: handleAddGear,
    handleEditGearItem: handleEditGearItem
});
