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

    vanBlockID,

    didInitialize,
    didRender,
    populateYourVans,

    handleAddVan,
    handleEditVanItem;

vanBlockID = 'yourvans-vans-block';

didInitialize = function() {
    var view = this;
    view.vanList = new VanList.constructor({
        rootURL: Config.API_URL
    });
    view.vanList.initialize();
    view.vanList.getUserVans(App.user.data.id, function() {
        view.render();
    });
};

didRender = function() {
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

populateYourVans = function(callback) {
    var view = this,
        YourVansItemTemplate;
    YourVansItemTemplate = require('../../templates/yourvans-item.html');

    var yourVansItemTemplate = _.template(YourVansItemTemplate),
        yourVans = view.vanList.data,
        $vanBlock, defaultVan, van, i, $vanItem;

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
        $('.sg-bg-image', $vanItem).css({
            'background-image': 'url("' + defaultVan.img_url + '")'
        });
        $vanBlock.append($vanItem);
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
};

handleAddVan = function() {
    App.router.openModalView('addvan');
};

handleEditVanItem = function(event) {
    var view = event.data,
        van;
    van = view.vanList.getVanItem('id', $(this).data('yourvanid'));
    App.router.openModalView('editvan', van);
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    populateYourVans: populateYourVans,

    handleAddVan: handleAddVan,
    handleEditVanItem: handleEditVanItem
});
