/**
 * Controller for the Sharingear home/landing page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery'),

    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    testimonials,

    didInitialize,
    didRender,

    loadSearchBar,
    renderTestimonials,
    loadFooter,

    handleTab,
    handleLogin,
    handleScrollDown;

testimonials = [{
    image_file: 'images/testimonials/3.jpg',
    citation: 'Got some gear or need some gear? It\'s all there on Sharingear. Get your gear out there, and get it workin\' for you.',
    name: 'stephen carpenter',
    role: 'guitarist',
    band: 'deftones'
}, {
    image_file: 'images/testimonials/1.jpg',
    citation: 'It\'s kind of like a marketplace, friendship and community to share instruments and save costs and make some money. It\'s a way to make it easier for each other as musicians in bands - a way for everyone to help out.',
    name: 'peter dolving',
    role: 'vocalist',
    band: 'ex-the haunted/iamfire'
}, {
    image_file: 'images/testimonials/2.jpg',
    citation: 'If you are in a band, flying into some place in Europe, sometimes instead of having to get the whole backline, maybe if you just need to fly in and play one show, there are musicians in other towns, possibliy in your town, that have gear just laying around you can rent.',
    name: 'ryan knight',
    role: 'guitarist',
    band: 'the black dahlia murder'
}, {
    image_file: 'images/testimonials/4.jpg',
    citation: 'This is an extremely cool service and something that every musician needs to use. From time to time I do rent out of my mesa-boogie cabinets, and with this platform I am able to connect with more musicians than before. Try it out, I guarantee its a great experience for everyone playing music.',
    name: 'franz gottschalk',
    role: 'guitarist',
    band: 'ex-volbeat'
}, {
    image_file: 'images/testimonials/6.jpg',
    citation: 'Musicians need to work more close together as the market doesn\'t leave anything left for those who actually create the music. Sharingear facilitates a networking opportunity, where you can not only save costs but also make cash from your gear.',
    name: 'ken holst',
    role: 'guitarist',
    band: 'illdisposed'
}, {
    image_file: 'images/testimonials/5.jpg',
    citation: 'Need som equipment for a recording session and don\'t think your own gear is up to par? Or do you just want to try out some different possibilities in your own rehearsal space before deciding what to buy for yourself? Sharingear is the way to go...',
    name: 'mathias jensen',
    role: 'guitarist',
    band: 'hobby musician'
}];

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
    this.renderTestimonials();
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

renderTestimonials = function() {
    var view = this,
        TestimonialTemplate;

    TestimonialTemplate = require('../../templates/testimonial.html');

    var testimonialTemplate = _.template(TestimonialTemplate),
        $owlContainer = $('.owl-carousel', view.$element),
        $testimonial,
        i;

    for (i = 0; i < testimonials.length; i++) {
        $testimonial = $(testimonialTemplate(testimonials[i]));
        $('.profile-pic', $testimonial).css({
            'background-image': 'url("' + testimonials[i].image_file + '")'
        });
        $owlContainer.append($testimonial);
    }

    $owlContainer.owlCarousel({
        slideSpeed: 300,
        paginationSpeed: 400,
        singleItem: true
    });
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
            App.rootVC.header.render();
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
    renderTestimonials: renderTestimonials,
    loadFooter: loadFooter,

    handleTab: handleTab,
    handleLogin: handleLogin,
    handleScrollDown: handleScrollDown
});
