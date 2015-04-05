/**
 * Entry point for the Sharingear frontend test suite.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore');

require('phantomjs-polyfill');

//Muscle tests
require('mocha!./specs/app.spec.js');
require('mocha!./specs/config.spec.js');
require('mocha!./specs/router.spec.js');
require('mocha!./specs/viewloader.spec.js');
require('mocha!./specs/viewcontroller.spec.js');
require('mocha!./specs/model.spec.js');
require('mocha!./specs/utilities.spec.js');

//Sharingear viewcontroller tests
//require('mocha!./specs')

//Configure underscore templates to use Handlebars style
_.templateSettings = {
    evaluate: /\{\{=(.+?)\}\}/g,
    interpolate: /\{\{(.+?)\}\}/g,
    escape: /\{\{-(.+?)\}\}/g
};

window.mocha.setup('bdd');
