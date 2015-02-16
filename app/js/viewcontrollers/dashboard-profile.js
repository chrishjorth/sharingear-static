/**
 * Controller for the Sharingear Profile dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'app', 'config', 'models/localization', 'moment'],
	function(_, $, ViewController, App, Config, Localization, Moment) {

		var didInitialize,
			handleImageUpload,
			didRender,
            populateBirthdateInput,
            populateCountries,

            handleUploadPicButton,
            handleBirthdateChange,
			handleSave;
            
        didInitialize= function() {
            var profileImgLoaded = $.Deferred(),
				userData;

            if(App.user.data.id === null) {
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

        didRender=function() {
            var view = this,
                userData = this.user.data,
                birthdate, $countriesSelect;

            if(App.header) {
                App.header.setTitle('Your profile');
            }

            $('#dashboard-profile-form #name', this.$element).val(userData.name);
            $('#dashboard-profile-form #surname', this.$element).val(userData.surname);
            $('#dashboard-profile-form #email', this.$element).val(userData.email);
            $('#dashboard-profile-form #hometown', this.$element).val(userData.city);

            this.populateBirthdateInput();
            if(userData.birthdate !== null) {
                birthdate = new Moment(userData.birthdate, 'YYYY-MM-DD');
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

            $.when(this.profileImgLoaded).then(function() {
                var $profilePic = $('#dashboard-profile-pic', view.$element),
                    img = view.profileImg;
                $profilePic.css('background-image', 'url("' + img.src + '")');
                if(img.width < img.height) {
                    $profilePic.css({
                        'background-size': '100% auto'
                    });
                }
                else{
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
                today = new Moment(),
                selectedYear = null,
                selectedMonth = null,
                maxYear, monthDays, i;

            selectedYear = $selectYear.val();
            maxYear = today.year() - Config.MIN_USER_AGE;
            for(i = 1914; i <= maxYear; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectYear.html(html);
            if(selectedYear !== null) {
                $selectYear.val(selectedYear);
            }

            selectedMonth = $selectMonth.val();
            html = '<option> - </option>';
            for(i = 1; i <= 12; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectMonth.html(html);
            if(selectedMonth !== null) {
                $selectMonth.val(selectedMonth);
            }
            

            monthDays = new Moment(selectedYear + '-' + selectedMonth + '-' + 1, 'YYYY-MM-DD');
            monthDays = monthDays.endOf('month').date();
            html = '<option> - </option>';
            for(i = 1; i <= monthDays; i++) {
                html += '<option value="' + i + '">' + i + '</option>';
            }
            $selectDay.html(html);
            
            html = '';
        };

        populateCountries = function($select) {
            var countriesArray = Localization.getCountries(),
                html = $('option', $select).first()[0].outerHTML,
                i;
                
            for(i = 0; i < countriesArray.length; i++) {
                html += '<option value="' + countriesArray[i].code + '">' + countriesArray[i].name + '</option>';
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

            view.user.uploadProfilePicture($file.get(0).files[0], $file.val().split('\\').pop(),App.user.data.id, function (error,url) {
                var $profilePic;

                $('.dashboard-profile-pic-upload-btn', view.$element).html('Upload photo');

                if(error) {
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
                saveData;

            if(view.isSaving === true) {
                return;
            }

            // add spinner to btn
            $('#saveButton', view.$element).html('<i class="fa fa-circle-o-notch fa-fw fa-spin">');

            saveData = {
                name: $('#dashboard-profile-form #name', view.$element).val(),
                surname: $('#dashboard-profile-form #surname', view.$element).val(),
                email: $('#dashboard-profile-form #email', view.$element).val(),
                city: $('#dashboard-profile-form #hometown', view.$element).val(),
                bio: $('#dashboard-profile-form #bio', view.$element).val(),
                birthdate: $('#dashboard-profile-birthdate-year', view.$element).val() + '-' + $('#dashboard-profile-birthdate-month', view.$element).val() + '-' + $('#dashboard-profile-birthdate-date', view.$element).val(),
                address: $('#dashboard-profile-address', view.$element).val(),
                postal_code: $('#dashboard-profile-postalcode', view.$element).val(),
                country: $('#dashboard-profile-country', view.$element).val(),
                phone: $('#dashboard-profile-phone', view.$element).val()
            };

            if ($('#dashboard-profile-form #name', view.$element).val()==='') {
                alert('The name field is required.');
                return;
            }

            if ($('#dashboard-profile-form #surname', view.$element).val()==='') {
                alert('The surname field is required.');
                return;
            }

            if ($('#dashboard-profile-form #email', view.$element).val()==='') {
                alert('The email field is required.');
                return;
            }

            view.isSaving = true;

            _.extend(view.user.data, saveData);

            view.user.update(function (error) {
                view.isSaving = false;
                // clear spinner on the button
                $('#saveButton', view.$element).text('Save');

                if(error){
                    console.log(error);
                    return;
                }
                $('#saveSuccessDiv', view.$element).html('Your profile has been updated.');
            });
        };

		return ViewController.inherit({
			didInitialize: didInitialize,
			handleImageUpload: handleImageUpload,
			didRender: didRender,
            populateBirthdateInput: populateBirthdateInput,
            populateCountries: populateCountries,

            handleUploadPicButton: handleUploadPicButton,
            handleBirthdateChange: handleBirthdateChange,
			handleSave:handleSave
		});

	}
);
