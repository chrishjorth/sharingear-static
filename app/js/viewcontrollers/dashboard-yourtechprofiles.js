/**
 * Controller for the Sharingear Your tech profiles dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    TechProfileList = require('../models/techprofilelist.js'),

    techprofilesBlockID,

    didInitialize,
    didRender,
    populateYourTechProfiles,

    handleAddTechProfile,
    handleEditTechProfileItem;

techprofilesBlockID = 'yourtechprofiles-techprofile-block';

didInitialize = function() {
    var view = this;
    view.techProfilesList = new TechProfileList.constructor({
        rootURL: Config.API_URL
    });
    view.techProfilesList.initialize();
    view.techProfilesList.getUserTechProfiles(App.user.data.id, function() {
        view.render();
    });
};

didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Your technician profiles');
    }

    if (this.techProfilesList.data.length > 0) {
        this.populateYourTechProfiles();
    } else {
        $('#' + techprofilesBlockID, this.$element).append('You haven\'t listed any technician profiles yet!');
    }

    this.setupEvent('click', '#dashboard-yourtechprofiles-add-btn', this, this.handleAddTechProfile);
    this.setupEvent('click', '.yourtechprofiles-item-edit-btn', this, this.handleEditTechProfileItem);
};

populateYourTechProfiles = function(callback) {
    var view = this,
        YourTechProfilesItemTemplate;
    YourTechProfilesItemTemplate = require('../../templates/yourtechprofiles-item.html');
    var yourTechProfilesItemTemplate = _.template(YourTechProfilesItemTemplate),
        yourTechProfiles = view.techProfilesList.data,
        $techProfilesBlock, defaultTechProfile, techProfile, i, $techProfileItem;

    $techProfilesBlock = $('#' + techprofilesBlockID, view.$element);
    for (i = 0; i < yourTechProfiles.length; i++) {
        techProfile = yourTechProfiles[i].data;
        defaultTechProfile = {
            id: null,
            roadie_type: '',
            owner_id: null,
            icon: techProfile.roadie_type.replace(/\s/g, '').toLowerCase()
        };
        _.extend(defaultTechProfile, techProfile);

        $techProfileItem = $(yourTechProfilesItemTemplate(defaultTechProfile));

        $techProfilesBlock.append($techProfileItem);
    }
    if (callback && typeof callback === 'function') {
        callback();
    }
};

handleAddTechProfile = function() {
    App.router.openModalView('addtechprofile');
};

handleEditTechProfileItem = function(event) {
    var view = event.data,
        techProfile;
    techProfile = view.techProfilesList.getTechProfileItem('id', $(this).data('yourtechprofileid'));
    App.router.openModalView('edittechprofile', techProfile);
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    populateYourTechProfiles: populateYourTechProfiles,

    handleAddTechProfile: handleAddTechProfile,
    handleEditTechProfileItem: handleEditTechProfileItem
});
