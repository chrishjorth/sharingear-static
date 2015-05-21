/**
 * Handles viewcontroller and template loading.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var _ = require('underscore'),
    $ = require('jquery'),

    ViewLoader,
    mainViewContainer,
    $modalViewLightbox,
    modalViewContainer,

    loadView,
    loadSubview,
    loadModalView,
    loadModalViewSibling,
    closeModalView,

    _loadModalView;

mainViewContainer = '.view-container';
$modalViewLightbox = $('#modal-view-lightbox');
modalViewContainer = '.modal-view-container';

/**
 * Note that a path for a subviews could also simply be a content reference, fx gear/1
 */
//TODO: Consider turning this into recursive for the case of subviews
loadView = function(view, path, data, callback) {
    var viewLoader = this,
        renderSubviews, ViewController, ViewTemplate, landingIndex, template;

    renderSubviews = function() {
        var subview = viewLoader.currentViewController.subPath;
        if (subview !== null && subview !== '') {
            viewLoader.loadSubview(data, function() {
                if (_.isFunction(callback) === true) {
                    callback(null, viewLoader.currentViewController);
                }
            });
        } else {
            if (_.isFunction(callback) === true) {
                callback(null, viewLoader.currentViewController);
            }
        }
    };
    //If the view is already loaded just update the path and call render subviews
    if (this.currentViewController !== null && this.currentViewController.name === view && this.currentViewController.hasSubviews === true) {
        this.currentViewController.path = path;
        this.currentViewController.setSubPath();
        renderSubviews();
        return;
    }

    try {
        console.log('view: ' + view);
        landingIndex = view.indexOf('landing-');
        console.log('landingIndex: ' + landingIndex);
        if (landingIndex >= 0) {
            template = view.substring(0, landingIndex - 1); //-1 to remove the _, landing page name scheme: view_landing-customname.js
            ViewController = require('./viewcontrollers/landingpages/' + view + '.js');
            ViewTemplate = require('../templates/' + template + '.html');
        } else {
            ViewController = require('./viewcontrollers/' + view + '.js');
            ViewTemplate = require('../templates/' + view + '.html');
        }
    } catch (error) {
        callback(error.message);
        return;
    }


    //Close the previous controller properly before loading a new one
    if (viewLoader.currentViewController !== null) {
        viewLoader.currentViewController.close();
    }
    viewLoader.currentViewController = new ViewController({
        name: view,
        $element: $(mainViewContainer),
        labels: {},
        template: ViewTemplate,
        path: path,
        passedData: data
    });
    viewLoader.currentViewController.initialize();
    //The ready property is so a controller can abort loading, useful if a redirect is being called
    if (viewLoader.currentViewController.ready === true) {
        viewLoader.currentViewController.render(function() {
            renderSubviews();
        });
    } else {
        callback('Loading of view was aborted by controller.');
    }
};

loadSubview = function(data, callback) {
    var viewLoader = this,
        subview = this.currentViewController.subPath,
        viewString = this.currentViewController.name + '-' + subview,
        SubViewController, SubViewTemplate;

    SubViewController = require('./viewcontrollers/' + viewString + '.js');
    SubViewTemplate = require('../templates/' + viewString + '.html');

    if (viewLoader.currentSubViewController !== null) {
        viewLoader.currentSubViewController.close();
    }
    viewLoader.currentSubViewController = new SubViewController({
        name: viewString,
        $element: viewLoader.currentViewController.$subViewContainer,
        labels: {},
        template: SubViewTemplate,
        path: viewLoader.currentViewController.path,
        passedData: data
    });
    viewLoader.currentSubViewController.initialize();
    viewLoader.currentSubViewController.render(function() {
        if (_.isFunction(viewLoader.currentViewController.didRenderSubview) === true) {
            viewLoader.currentViewController.didRenderSubview();
        }
    });
    if (_.isFunction(callback) === true) {
        callback(null, viewLoader.currentSubViewController);
    }
};

/**
 * Does the heavy lifting regardless of the openModalViews array.
 */
_loadModalView = function(view, path, data, callback) {
    var viewLoader = ViewLoader,
        $modalViewContainer = $(modalViewContainer),
        ViewController, ViewTemplate;

    ViewController = require('./viewcontrollers/' + view + '.js');
    ViewTemplate = require('../templates/' + view + '.html');

    if (viewLoader.currentModalViewController !== null) {
        viewLoader.currentModalViewController.close();
        viewLoader.openModalViews.pop();
    }

    if ($modalViewLightbox.hasClass('hidden') === true) {
        $modalViewLightbox.removeClass('hidden');
        $('body').addClass('modal-open');
        $('.view-container').addClass('modal-open');
    }

    viewLoader.currentModalViewController = new ViewController({
        name: view,
        $element: $modalViewContainer,
        labels: {},
        template: ViewTemplate,
        path: path,
        passedData: data
    });
    viewLoader.currentModalViewController.initialize();
    if (viewLoader.currentModalViewController.ready === true) {
        viewLoader.currentModalViewController.render(function(error, subview, $subViewContainer) {
            if (!error && subview && subview !== null) {
                viewLoader.loadSubview(subview, $subViewContainer, data);
            }
        });
    }

    callback(null, viewLoader.currentModalViewController);
};

loadModalView = function(view, path, data, callback) {
    var viewLoader = this;

    viewLoader.openModalViews.unshift({
        view: view,
        path: path,
        data: data,
        callback: callback
    });

    if (viewLoader.openModalViews.length <= 1) {
        _loadModalView(view, path, data, callback);
    } else {
        callback(null, viewLoader.currentModalViewController);
    }
};

loadModalViewSibling = function(view, path, data, callback) {
    this.openModalViews.unshift({
        view: view,
        path: path,
        data: data,
        callback: callback
    });
    _loadModalView(view, path, data, callback);
};

closeModalView = function(callback) {
    var viewLoader = this,
        previousModal = null;

    if (this.currentModalViewController !== null) {
        this.currentModalViewController.close();
        this.currentModalViewController = null;
    }
    if ($modalViewLightbox.hasClass('hidden') === false) {
        $modalViewLightbox.addClass('hidden');
        $('body').removeClass('modal-open');
        $('.view-container').removeClass('modal-open');
    }

    //Remove modal from queue
    this.openModalViews.pop();

    if (this.openModalViews.length > 0) {
        previousModal = this.openModalViews[this.openModalViews.length - 1];
        _loadModalView(previousModal.view, previousModal.path, previousModal.data, function(error, loadedModalViewController) {
            if (_.isFunction(previousModal.callback) === true) {
                previousModal.callback();
            }
            callback(null, loadedModalViewController);
        });
    } else {
        //Render the underlying view again so that data gets updated
        this.loadView(viewLoader.currentViewController.name, viewLoader.currentViewController.path, viewLoader.currentViewController.passedData, function() {
            if (_.isFunction(callback)) {
                callback(null, previousModal);
            }
        });
    }
};

ViewLoader = {
    currentViewController: null,
    currentSubViewController: null,
    currentModalViewController: null,
    openModalViews: [],

    loadView: loadView,
    loadSubview: loadSubview,
    loadModalView: loadModalView,
    loadModalViewSibling: loadModalViewSibling,
    closeModalView: closeModalView
};
module.exports = ViewLoader;
