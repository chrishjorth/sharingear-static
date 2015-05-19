/**
 * Controller for the Sharingear Copyright view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),
	
	ViewController = require('../viewcontroller');

function Copyright(options) {
    ViewController.call(this, options);
}

Copyright.prototype = new ViewController();

Copyright.prototype.didInitialize = function() {
    this.setTitle('Sharingear - Copyright policy');
    this.setDescription('Sharingear respects and expects its users to respect the intellectual property of others.');
};

Copyright.prototype.didRender = function() {
    this.loadFooter();
};

Copyright.prototype.loadFooter = function() {
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

module.exports = Copyright;
