/**
 * Controller for the Sharingear Privacy page view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
	
	ViewController = require('../viewcontroller.js');

function Privacy(options) {
    ViewController.call(this, options);
}

Privacy.prototype = new ViewController();

Privacy.prototype.didInitialize = function() {
    this.setTitle('Sharingear - Privacy policy');
};

Privacy.prototype.didRender = function() {
    this.loadFooter();
};

Privacy.prototype.loadFooter = function() {
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

module.exports = Privacy;
