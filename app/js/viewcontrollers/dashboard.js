/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var $ = require('jquery'),

    ViewController = require('../viewcontroller.js'),
    App = require('../app.js'),

    subViewContainerID = 'dashboard-subview-container';

function Dashboard(options) {
    ViewController.call(this, options);
}

Dashboard.prototype = new ViewController();

Dashboard.prototype.didInitialize = function() {
    if (App.user.data.id === null) {
        this.ready = false;
        App.router.navigateTo('home');
        return;
    }

    this.hasSubviews = true;

    this.$subViewContainer = $('');
};

Dashboard.prototype.didRender = function() {
    this.$subViewContainer = $('#' + subViewContainerID);
    this.setupEvent('click', '.dashboard-menu .list-group-item', this, this.handleSelection);
    //We need to make sure that a subview gets rendered
    if (this.path === 'dashboard') {
        App.router.navigateTo('dashboard/profile');
    }
};

Dashboard.prototype.didRenderSubview = function() {
    var $menuItem;
    $menuItem = $('a[href="#' + this.path + '"]');
    this.changeActiveState($menuItem);
};

Dashboard.prototype.handleSelection = function(event) {
    var view = event.data,
        $this = $(this);
    if ($this.hasClass('disabled') === true) {
        alert('This feature will be enabled soon, please stay tuned.');
        return;
    }
    view.changeActiveState($this);
};

Dashboard.prototype.changeActiveState = function($menuItem) {
    $('.list-group-item', this.$element).removeClass('list-group-item-selected');
    $menuItem.addClass('list-group-item-selected');
};

module.exports = Dashboard;
