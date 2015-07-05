/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),
    ContentClassification = require('../models/contentclassification.js');

function DashboardProfile(options) {
    ViewController.call(this, options);
    this.templateParameters = {
        bio: ''
    };
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
    this.profileImg.alt = 'Image of Sharingear user ' + this.user.data.name + '.';
    this.profileImg.src = this.user.data.image_url;

    this.setTitle('Sharingear Dashboard - Your profile');
    this.setDescription('An overview of the data shown on your public profile on Sharingear.');
};

DashboardProfile.prototype.didRender = function() {
    var view = this,
        userData = this.user.data;

    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Your profile');
    }

    view.renderUserTypes();
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

DashboardProfile.prototype.renderUserTypes = function() {
    var view = this,
        userClassification = ContentClassification.data.userClassification,
        html = '';

    if(!userClassification) {
        return;
    }

    userClassification.forEach(function(entry){
        if (Array.isArray(view.user.data.user_types)) {

            if (view.user.data.user_types.indexOf(entry.user_type) > -1) {
                html += '<input type="checkbox" name="' + entry.user_type + '" value="' + entry.user_type + '"checked> ' + entry.user_type + '<br>';
            } else {
                html += '<input type="checkbox" name="' + entry.user_type + '" value="' + entry.user_type + '"> ' + entry.user_type + '<br>';
            }

        }else{
                html += '<input type="checkbox" name="' + entry.user_type + '" value="' + entry.user_type + '"> ' + entry.user_type + '<br>';
        }
    });

    $('#dashboard-profile-usertypes', view.$element).html(html);
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
            if(error.code === Config.ERR_AUTH) {
                console.log('Your login session expired.');
                App.router.navigateTo('home');
            }
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
        userTypeArray = [],
        saveData;

    if (view.isSaving === true) {
        return;
    }

    //Push the checked checkboxes to the array
    $('#dashboard-profile-usertypes input:checked', view.$element).each(function() {
        userTypeArray.push(this.name);
    });

    saveData = {
        name: $('#dashboard-profile-form #name', view.$element).val(),
        surname: $('#dashboard-profile-form #surname', view.$element).val(),
        band_name: $('#dashboard-profile-form #dashboard-profile-band', this.$element).val(),
        company_name: $('#dashboard-profile-form #dashboard-profile-company', this.$element).val(),
        bio: $('#dashboard-profile-form #bio', this.$element).val(),
        user_types: userTypeArray
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
