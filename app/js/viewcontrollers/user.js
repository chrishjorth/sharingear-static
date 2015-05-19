/**
 * Controller for the Sharingear User profile view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    Config = require('../config.js'),
    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    UserModel = require('../models/user.js'),
    GearList = require('../models/gearlist.js'),
    TechProfileList = require('../models/techprofilelist.js'),
    VanList = require('../models/vanlist.js');

function User(options) {
    ViewController.call(this, options);
}

User.prototype = new ViewController();

User.prototype.didInitialize = function() {
    var view = this,
        pathSections, gearID;

    pathSections = this.subPath.split('/');
    gearID = pathSections[0];
    if (pathSections.length > 1 && pathSections[1] !== '') {
        this.currentTab = pathSections[1];
    } else {
        this.currentTab = 'info';
    }
    this.subPath = ''; //To avoid rendering a subview based on the gear id

    this.user = new UserModel({
        rootURL: Config.API_URL,
        data: {
            id: gearID
        }
    });
    this.user.initialize();

    this.templateParameters = {
        name: '',
        bio: ''
    };

    this.user.fetch(function(error) {
        if (error) {
            console.error('Error fetching user: ' + error);
            return;
        }
        view.templateParameters = {
            name: view.user.data.name + ' ' + view.user.data.surname.substring(0, 1) + '.',
            bio: view.user.data.bio
        };
        view.render();
        view.setTitle('Sharingear - ' + view.templateParameters.name);
        view.setDescription(view.user.data.bio);
    });

    this.userGear = new GearList({
        rootURL: Config.API_URL
    });
    this.userGear.initialize();
    this.userGear.getUserGear(this.user.data.id, function() {
        view.render();
    });

    this.userTechProfiles = new TechProfileList({
        rootURL: Config.API_URL
    });
    this.userTechProfiles.initialize();
    this.userTechProfiles.getUserTechProfiles(this.user.data.id, function() {
        view.render();
    });

    this.userVans = new VanList({
        rootURL: Config.API_URL
    });
    this.userVans.initialize();
    this.userVans.getUserVans(this.user.data.id, function() {
        view.render();
    });
};

User.prototype.didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle('User');
        App.rootVC.header.enableBackButton();
    }

    this.renderProfilePic();
    this.renderTabs();
    this.populateGear();
    this.populateTechProfiles();
    this.populateVans();

    this.setupEvent('click', '.sg-tabs button', this, this.handleTab);
};

User.prototype.renderProfilePic = function() {
    var view = this,
        img;

    if (!this.user.data.image_url) {
        return;
    }

    img = new Image();
    img.onload = function() {
        var backgroundSize;
        if (img.width < img.height) {
            backgroundSize = '100% auto';
        } else {
            backgroundSize = 'auto 100%';
        }
        $('.profile-pic', view.$element).css({
            'background-image': 'url(' + img.src + ')',
            'background-size': backgroundSize
        });
    };
    img.src = this.user.data.image_url;
};

User.prototype.populateGear = function() {
    var view = this,
        GearItemTemplate;

    GearItemTemplate = require('../../templates/user-gear-item.html');
    var gearItemTemplate = _.template(GearItemTemplate),
        gearList = view.userGear.data,
        $gearBlock, defaultGear, gear, i, $gearItem;

    $gearBlock = $('#user-gear-container', view.$element);
    $gearBlock.empty();
    for (i = 0; i < gearList.length; i++) {
        defaultGear = {
            id: null,
            gear_type: '',
            subtype: '',
            brand: '',
            model: '',
            img_url: 'images/placeholder_grey.png'
        };

        gear = gearList[i];
        _.extend(defaultGear, gear.data);
        if (defaultGear.images.length > 0) {
            defaultGear.img_url = defaultGear.images.split(',')[0];
        }
        $gearItem = $(gearItemTemplate(defaultGear));
        $('.sg-bg-image', $gearItem).css({
            'background-image': 'url("' + defaultGear.img_url + '")'
        });
        $gearBlock.append($gearItem);
    }
};

User.prototype.populateTechProfiles = function() {
    var view = this,
        TechProfilesItemTemplate;
    TechProfilesItemTemplate = require('../../templates/user-techprofiles-item.html');

    var techProfilesItemTemplate = _.template(TechProfilesItemTemplate),
        techProfileList = view.userTechProfiles.data,
        $techProfilesBlock, defaultTechProfiles, techProfile, i, $techProfilesItem;

    $techProfilesBlock = $('#user-techprofiles-container', view.$element);
    $techProfilesBlock.empty();
    for (i = 0; i < techProfileList.length; i++) {
        techProfile = techProfileList[i].data;
        defaultTechProfiles = {
            id: null,
            roadie_type: '',
            icon: techProfile.roadie_type.replace(/\s/g, '').toLowerCase()
        };
        _.extend(defaultTechProfiles, techProfile);
        $techProfilesItem = $(techProfilesItemTemplate(defaultTechProfiles));
        $techProfilesBlock.append($techProfilesItem);
    }
};

User.prototype.populateVans = function() {
    var view = this,
        VanItemTemplate;
    VanItemTemplate = require('../../templates/user-vans-item.html');
    var vanItemTemplate = _.template(VanItemTemplate),
        vanList = view.userVans.data,
        $vanBlock, defaultVan, van, i, $vanItem;

    $vanBlock = $('#user-vans-container', view.$element);
    $vanBlock.empty();
    for (i = 0; i < vanList.length; i++) {
        defaultVan = {
            id: null,
            van_type: '',
            subtype: '',
            brand: '',
            model: '',
            img_url: 'images/placeholder_grey.png'
        };

        van = vanList[i];
        _.extend(defaultVan, van.data);
        if (defaultVan.images.length > 0) {
            defaultVan.img_url = defaultVan.images.split(',')[0];
        }
        $vanItem = $(vanItemTemplate(defaultVan));
        $('.sg-bg-image', $vanItem).css({
            'background-image': 'url("' + defaultVan.img_url + '")'
        });
        $vanBlock.append($vanItem);
    }
};

User.prototype.renderTabs = function() {
    var view = this;
    $('.sg-tab-panel', view.$element).each(function() {
        var $this = $(this),
            $listItem;
        $listItem = $this.parent().parent();

        if ($this.hasClass(view.currentTab) === true) {
            $this.removeClass('hidden');
            if ($listItem.hasClass('active') === false) {
                $listItem.addClass('active');
            }
        } else {
            if ($this.hasClass('hidden') === false) {
                $this.addClass('hidden');
            }
            $listItem.removeClass('active');
        }
    });

    $('.sg-tabs li', view.$element).removeClass('active');
    $('#sg-tabs-' + view.currentTab, view.$element).addClass('active');
};

User.prototype.handleTab = function(event) {
    var view = event.data;
    view.currentTab = $(this).parent().attr('id').substring(8); //8 is the length of 'sg-tabs-'
    view.renderTabs();
};

module.exports = User;
