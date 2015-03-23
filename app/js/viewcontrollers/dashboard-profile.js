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

    Localization = require('../models/localization.js'),

    didInitialize,
    handleImageUpload,
    didRender,
    populateBirthdateInput,
    populateCountries,

    handleUploadPicButton,
    handleBirthdateChange,
    handleSave;

didInitialize = function() {
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

didRender = function() {
    var view = this,
        userData = this.user.data,
        birthdate, $countriesSelect, $nationalitiesSelect;
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('Your profile');
    }

    $('#dashboard-profile-form #name', this.$element).val(userData.name);
    $('#dashboard-profile-form #surname', this.$element).val(userData.surname);
    $('#dashboard-profile-form #email', this.$element).val(userData.email);
    $('#dashboard-profile-form #hometown', this.$element).val(userData.city);

    this.populateBirthdateInput();
    if (userData.birthdate !== null) {
        birthdate = new Moment.tz(userData.birthdate, 'YYYY-M-D', Localization.getCurrentTimeZone());
        $('#dashboard-profile-birthdate-year', view.$element).val(birthdate.year());
        $('#dashboard-profile-birthdate-month', view.$element).val(birthdate.month() + 1);
        $('#dashboard-profile-birthdate-date', view.$element).val(birthdate.date());
    }

    $('#dashboard-profile-address', this.$element).val(userData.address);
    $('#dashboard-profile-postalcode', view.$element).val(userData.postal_code);

    $countriesSelect = $('#dashboard-profile-country', this.$element);
    this.populateCountries($countriesSelect);
    $countriesSelect.val(userData.country);


    $('#dashboard-profile-phone', view.$element).val(userData.phone);

    $nationalitiesSelect = $('#dashboard-profile-nationalities', this.$element);
    this.populateCountries($nationalitiesSelect);
    $nationalitiesSelect.val(userData.nationality);

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
    this.setupEvent('change', '#dashboard-profile-birthdate-year, #dashboard-profile-birthdate-month', this, this.handleBirthdateChange);
};

populateBirthdateInput = function() {
    var $inputContainer = $('.birthday-select', this.$element),
        $selectDay = $('#dashboard-profile-birthdate-date', $inputContainer),
        $selectMonth = $('#dashboard-profile-birthdate-month', $inputContainer),
        $selectYear = $('#dashboard-profile-birthdate-year', $inputContainer),
        html = '<option> - </option>',
        today = new Moment.tz(Localization.getCurrentTimeZone()),
        selectedYear = null,
        selectedMonth = null,
        selectedDay = null,
        maxYear, monthDays, i;

    selectedYear = $selectYear.val();
    maxYear = today.year() - Config.MIN_USER_AGE;
    for (i = 1914; i <= maxYear; i++) {
        html += '<option value="' + i + '">' + i + '</option>';
    }
    $selectYear.html(html);
    if (selectedYear !== null && selectedYear !== '-') {
        $selectYear.val(selectedYear);
    } else {
        selectedYear = new Moment.tz(Localization.getCurrentTimeZone()).format('YYYY');
    }

    selectedMonth = $selectMonth.val();
    html = '<option> - </option>';
    for (i = 1; i <= 12; i++) {
        html += '<option value="' + i + '">' + i + '</option>';
    }
    $selectMonth.html(html);
    if (selectedMonth !== null) {
        $selectMonth.val(selectedMonth);
    }

    selectedDay = $selectDay.val();
    monthDays = new Moment.tz(selectedYear + '-' + selectedMonth + '-' + 1, 'YYYY-M-D', Localization.getCurrentTimeZone());
    monthDays = monthDays.endOf('month').date();
    html = '<option> - </option>';
    for (i = 1; i <= monthDays; i++) {
        html += '<option value="' + i + '">' + i + '</option>';
    }
    $selectDay.html(html);

    if (selectedDay !== null) {
        if (selectedDay <= monthDays) {
            $selectDay.val(selectedDay);
        } else {
            $selectDay.val('-');
        }
    } else {
        $selectDay.val('-');
    }

    html = '';
};

populateCountries = function($select) {
    var countriesArray = Localization.getCountries(),
        html = $('option', $select).first()[0].outerHTML,
        i;

    for (i = 0; i < countriesArray.length; i++) {
        html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name.replace(/\b./g, function(m) {
            return m.toUpperCase();
        }) + '</option>';
    }
    $select.html(html);
};

handleUploadPicButton = function(event) {
    var view = event.data;
    $('#profile-pic', view.$element).click();
};

handleImageUpload = function(event) {
    var view = event.data;
    var $file = $(this);

    $('.dashboard-profile-pic-upload-btn', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

    view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(), App.user.data.id, function(error, url) {
        var $profilePic;

        $('.dashboard-profile-pic-upload-btn', view.$element).html('Upload photo');

        if (error) {
            alert('Error uploading file.');
            console.log(error);
            return;
        }
        App.user.data.image_url = url;
        App.header.render();

        $profilePic = $('#dashboard-profile-pic', view.$element);
        $profilePic.css('background-image', 'url("' + url + '")');
    });
};

handleBirthdateChange = function(event) {
    var view = event.data;
    view.populateBirthdateInput();
};

handleSave = function(event) {
    var view = event.data,
        birthdate, saveData;

    if (view.isSaving === true) {
        return;
    }

    birthdate = $('#dashboard-profile-birthdate-year', view.$element).val() + '-' + $('#dashboard-profile-birthdate-month', view.$element).val() + '-' + $('#dashboard-profile-birthdate-date', view.$element).val();
    birthdate = new Moment.tz(birthdate, 'YYYY-M-D', true, Localization.getCurrentTimeZone());

    saveData = {
        name: $('#dashboard-profile-form #name', view.$element).val(),
        surname: $('#dashboard-profile-form #surname', view.$element).val(),
        email: $('#dashboard-profile-form #email', view.$element).val(),
        city: $('#dashboard-profile-form #hometown', view.$element).val(),
        bio: $('#dashboard-profile-form #bio', view.$element).val(),
        birthdate: birthdate.format('YYYY-M-D'),
        address: $('#dashboard-profile-address', view.$element).val(),
        postal_code: $('#dashboard-profile-postalcode', view.$element).val(),
        country: $('#dashboard-profile-country', view.$element).val(),
        phone: $('#dashboard-profile-phone', view.$element).val(),
        nationality: $('#dashboard-profile-nationalities', view.$element).val()
    };

    if ($('#dashboard-profile-form #name', view.$element).val() === '') {
        alert('The name field is required.');
        return;
    }

    if ($('#dashboard-profile-form #surname', view.$element).val() === '') {
        alert('The surname field is required.');
        return;
    }

    if ($('#dashboard-profile-form #email', view.$element).val() === '') {
        alert('The email field is required.');
        return;
    }

    if (birthdate.isValid() === false) {
        alert('Please select a valid date of birth');
        return;
    }

    if ($('#dashboard-profile-form #dashboard-profile-address', view.$element).val() === '') {
        alert('The address field is required.');
        return;
    }

    if ($('#dashboard-profile-form #dashboard-profile-postalcode', view.$element).val() === '') {
        alert('The postal code field is required.');
        return;
    }

    if ($('#dashboard-profile-form #hometown', view.$element).val() === '') {
        alert('The city field is required.');
        return;
    }

    if ($('#dashboard-profile-form #dashboard-profile-country', view.$element).val() === '') {
        alert('The country field is required.');
        return;
    }

    if ($('#dashboard-profile-form #dashboard-profile-phone', view.$element).val() === '') {
        alert('The phone field is required.');
        return;
    }

    if ($('#dashboard-profile-form #dashboard-profile-nationalities', view.$element).val() === '') {
        alert('The nationality field is required.');
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
            console.log(error);
            return;
        }
        $('#saveSuccessDiv', view.$element).html('Your profile has been updated.');
    });
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    handleImageUpload: handleImageUpload,
    didRender: didRender,
    populateBirthdateInput: populateBirthdateInput,
    populateCountries: populateCountries,

    handleUploadPicButton: handleUploadPicButton,
    handleBirthdateChange: handleBirthdateChange,
    handleSave: handleSave
});
