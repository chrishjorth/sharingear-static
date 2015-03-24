/**
 * Controller for the Sharingear Insurance view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    ViewController = require('../viewcontroller.js'),

    didRender,
    loadFooter;

didRender = function() {
    this.loadFooter();
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

module.exports = ViewController.inherit({
    didRender: didRender,
    loadFooter: loadFooter
});
