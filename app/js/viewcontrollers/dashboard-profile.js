/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),
    Moment = require('moment-timezone'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),
    ContentClassification = require('../models/contentclassification.js'),

    Localization = require('../models/localization.js');

function DashboardProfile(options) {
    ViewController.call(this, options);
}

DashboardProfile.prototype = new ViewController();

DashboardProfile.prototype.didInitialize = function() {
    var profileImgLoaded = $.Deferred(),
        userData;

    if (App.user.data.id === null) {
        this.ready = false;
        App.router.navigateTo('home');
        return;
    }

    this.user = App.user;

    userData = this.user.data;
    this.templateParameters = {
        bio: userData.bio
    };

    this.isSaving = false;

    //Start loading profile image
    this.profileImg = new Image();
    this.profileImg.onload = function() {
        profileImgLoaded.resolve();
    };
    this.profileImg.src = this.user.data.image_url;
};

DashboardProfile.prototype.didRender = function() {
    var view = this,
        userData = this.user.data,
        userClassification = ContentClassification.data.userClassification, 
        i ,userType, birthdate, $countriesSelect, $nationalitiesSelect;

    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Your profile');
    }

    $('#dashboard-profile-form #name', this.$element).val(userData.name);
    $('#dashboard-profile-form #surname', this.$element).val(userData.surname);
    $('#dashboard-profile-form #dashboard-profile-band', this.$element).val(userData.band_name);
    $('#dashboard-profile-form #dashboard-profile-company', this.$element).val(userData.company_name);

    $.when(this.profileImgLoaded).then(function() {
        var $profilePic = $('#dashboard-profile-pic', view.$element),
            img = view.profileImg;
        $profilePic.css('background-image', 'url("' + img.src + '")');
        if (img.width < img.height) {
            $profilePic.css({
                'background-size': '100% auto'
            });
        } else {
            $profilePic.css({
                'background-size': 'auto 100%'
            });
        }
    });

    this.setupEvent('click', '.dashboard-profile-pic-upload-btn', this, this.handleUploadPicButton);
    this.setupEvent('change', '#profile-pic', this, this.handleImageUpload);
    this.setupEvent('submit', '#dashboard-profile-form', this, this.handleSave);
};

DashboardProfile.prototype.handleUploadPicButton = function(event) {
    var view = event.data;
    $('#profile-pic', view.$element).click();
};

DashboardProfile.prototype.handleImageUpload = function(event) {
    var view = event.data;
    var $file = $(this);

    $('.dashboard-profile-pic-upload-btn', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

    view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
        var $profilePic;

        $('.dashboard-profile-pic-upload-btn', view.$element).html('Upload photo');

        if (error) {
            alert('Error uploading file.');
            console.error(error);
            return;
        }
        App.user.data.image_url = url;
        App.rootVC.header.render();

        $profilePic = $('#dashboard-profile-pic', view.$element);
        $profilePic.css('background-image', 'url("' + url + '")');
    });
};


DashboardProfile.prototype.handleSave = function(event) {
    var view = event.data,
        saveData;

    if (view.isSaving === true) {
        return;
    }

    saveData = {
        name: $('#dashboard-profile-form #name', view.$element).val(),
        surname: $('#dashboard-profile-form #surname', view.$element).val(),
        band_name: $('#dashboard-profile-form #dashboard-profile-band', this.$element).val(),
        company_name: $('#dashboard-profile-form #dashboard-profile-company', this.$element).val()
    };

    if ($('#dashboard-profile-form #name', view.$element).val() === '') {
        alert('The name field is required.');
        return;
    }

    if ($('#dashboard-profile-form #surname', view.$element).val() === '') {
        alert('The surname field is required.');
        return;
    }

    view.isSaving = true;
    // add spinner to btn
    $('#saveButton', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

    _.extend(view.user.data, saveData);

    view.user.update(function(error) {
        view.isSaving = false;
        // clear spinner on the button
        $('#saveButton', view.$element).text('Save');

        if (error) {
            console.error(error);
            return;
        }
        $('#saveSuccessDiv', view.$element).html('Your profile has been updated.');
    });
};

module.exports = DashboardProfile;
