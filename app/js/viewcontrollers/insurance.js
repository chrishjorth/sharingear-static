/**
 * Controller for the Sharingear Insurance view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    ViewController = require('../viewcontroller.js');

function Insurance(options) {
    ViewController.call(this, options);
}

Insurance.prototype = new ViewController();

Insurance.prototype.didRender = function() {
    this.loadFooter();
};

Insurance.prototype.loadFooter = function() {
    var view = this,
        FooterController, FooterTemplate;
    FooterController = require('./footer.js');
    FooterTemplate = require('../../templates/footer.html');
    view.footer = new FooterController({
        name: 'footer',
        $element: $('footer', view.$element),
        template: FooterTemplate
    });
    view.footer.initialize();
    view.footer.render();
};

module.exports = Insurance;
