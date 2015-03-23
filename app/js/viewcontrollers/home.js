/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    didInitialize,
    didRender,

    loadSearchBar,
    loadFooter,

    handleTab,
    handleLogin,
    handleScrollDown;

didInitialize = function() {
    this.hasSubviews = true;
    this.gearSearchFormVC = null;
    this.vanSearchFormVC = null;
};

didRender = function() {
    if (App.rootVC !== null && App.rootVC.header) {
        App.rootVC.header.setTitle();
    }

    this.loadSearchBar();
    this.loadFooter();

    this.setupEvent('click', '.sg-tabbar li .sg-btn-square', this, this.handleTab);
    this.setupEvent('click', '#home-scroll-btn', this, this.handleScrollDown);
};

loadSearchBar = function() {
    var view = this,
        gearSearchVC, gearSearchVT, techProfileSearchVC, techProfileSearchVT, vanSearchVC, vanSearchVT;
    gearSearchVC = require('./gearsearchform.js');
    gearSearchVT = require('../../templates/gearsearchform.html');
    view.gearSearchFormVC = new gearSearchVC.constructor({
        name: 'gearsearchform',
        $element: $('#home-searchform-gear .searchform-container', view.$element),
        template: gearSearchVT
    });
    view.gearSearchFormVC.initialize();
    view.gearSearchFormVC.render();

    techProfileSearchVC = require('./techprofilesearchform.js');
    techProfileSearchVT = require('../../templates/techprofilesearchform.html');
    view.techProfileSearchFormVC = new techProfileSearchVC.constructor({
        name: 'techprofilesearchform',
        $element: $('#home-searchform-techprofiles .searchform-container', view.$element),
        template: techProfileSearchVT
    });
    view.techProfileSearchFormVC.initialize();
    view.techProfileSearchFormVC.render();

    vanSearchVC = require('./vansearchform.js');
    vanSearchVT = require('../../templates/vansearchform.html');
    view.vanSearchFormVC = new vanSearchVC.constructor({
        name: 'vansearchform',
        $element: $('#home-searchform-vans .searchform-container', view.$element),
        template: vanSearchVT
    });
    view.vanSearchFormVC.initialize();
    view.vanSearchFormVC.render();
};

loadFooter = function() {
    var view = this,
        FooterController, FooterTemplate;
    FooterController = require('./footer.js');
    FooterTemplate = require('../../templates/footer.html');
    view.footer = new FooterController.constructor({
        name: 'footer',
        $element: $('footer', view.$element),
        template: FooterTemplate
    });
    view.footer.initialize();
    view.footer.render();
};

handleTab = function(event) {
    var $this = $(this),
        view = event.data,
        id;
    id = $this.attr('id');

    $('.sg-tabbar li .sg-btn-square', view.$element).removeClass('selected');
    $this.addClass('selected');

    $('.sg-tab-panel', view.$element).each(function() {
        var $panel = $(this);
        if ($panel.hasClass('hidden') === false) {
            $panel.addClass('hidden');
        }
    });
    $('#home-searchform-' + id.substring(9), view.$element).removeClass('hidden'); //9 is the length of 'home-tab-'
};

handleLogin = function() {
    App.user.login(function(error) {
        if (!error) {
            App.router.navigateTo('dashboard');
            App.header.render();
            return;
        }
        console.log(error);
    });
};

handleScrollDown = function(event) {
    var view = event.data;

    $('html,body').animate({
        scrollTop: $('#home-whatsay', view.$element).offset().top - 60
    }, 1000);
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,

    loadSearchBar: loadSearchBar,
    loadFooter: loadFooter,

    handleTab: handleTab,
    handleLogin: handleLogin,
    handleScrollDown: handleScrollDown
});
