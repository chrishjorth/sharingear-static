/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    subViewContainerID,

    didInitialize,
    didRender,
    didRenderSubview,

    handleSelection,

    changeActiveState;

/* Static variables */
subViewContainerID = 'dashboard-subview-container';

didInitialize = function() {
    if (App.user.data.id === null) {
        this.ready = false;
        App.router.navigateTo('home');
        return;
    }

    this.hasSubviews = true;

    this.$subViewContainer = $('');
};

didRender = function() {
    this.$subViewContainer = $('#' + subViewContainerID);
    this.setupEvent('click', '.dashboard-menu .list-group-item', this, this.handleSelection);
    //We need to make sure that a subview gets rendered
    if (this.path === 'dashboard') {
        App.router.navigateTo('dashboard/profile');
    }
};

didRenderSubview = function() {
    var $menuItem;
    $menuItem = $('a[href="#' + this.path + '"]');
    this.changeActiveState($menuItem);
};

handleSelection = function(event) {
    var view = event.data,
        $this = $(this);
    if ($this.hasClass('disabled') === true) {
        alert('This feature will be enabled soon, please stay tuned.');
        return;
    }
    view.changeActiveState($this);
};

changeActiveState = function($menuItem) {
    $('.list-group-item', this.$element).removeClass('list-group-item-selected');
    $menuItem.addClass('list-group-item-selected');
};

module.exports = ViewController.inherit({
    didInitialize: didInitialize,
    didRender: didRender,
    didRenderSubview: didRenderSubview,

    handleSelection: handleSelection,

    changeActiveState: changeActiveState
});
