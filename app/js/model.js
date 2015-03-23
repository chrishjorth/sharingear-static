/**
 * General model object with support for jQuery ajax.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
	$ = require('jquery'),

	Utilities = require('./utilities.js'),

	initialize,
    get,
    post,
    put,
    del,

    constructor, inherit;

initialize = function() {
    if (this.didInitialize && typeof this.didInitialize == 'function') {
        this.didInitialize();
    }
};

get = function(url, callback) {
    var encodedURL = encodeURI(this.rootURL + url);
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: encodedURL,
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            callback('Error executing GET request: ' + errorThrown);
        },
        success: function(data) {
            if (data.error) {
                callback('Error retrieving resource from server: ' + data.error);
            } else {
                callback(null, data);
            }
        }
    });
};

post = function(url, data, callback) {
    var encodedURL = encodeURI(this.rootURL + url);

    $.ajax({
        dataType: 'json',
        type: 'POST',
        data: data,
        url: encodedURL,
        error: function(jqXHR, textStatus, errorThrown) {
            callback('Error executing POST request: ' + errorThrown);

        },
        success: function(data) {

            if (data.error) {
                callback('Error sending resource to server: ' + data.error);
            } else {
                callback(null, data);
            }
        }
    });
};

put = function(url, data, callback) {
    var encodedURL = encodeURI(this.rootURL + url);

    $.ajax({
        dataType: 'json',
        type: 'PUT',
        data: data,
        url: encodedURL,
        error: function(jqXHR, textStatus, errorThrown) {
            callback('Error executing PUT request: ' + errorThrown);
        },
        success: function(data) {
            if (data.error) {
                console.log(data.error);
                callback('Error putting resource to server: ' + data.error);
            } else {
                callback(null, data);
            }
        }
    });
};

del = function() {

};

constructor = function(options) {
    var defaults, methods;

    defaults = {
        rootURL: '',
        data: null
    };

    methods = {
        initialize: initialize,
        get: get,
        post: post,
        put: put,
        del: del
    };
    _.extend(this, defaults, methods, options);
};

inherit = function(inheritOptions) {
    var inherited = {
        constructor: Utilities.inherit(this.constructor, inheritOptions)
    };
    return inherited;
};

//This pattern is because of require.js, which calls new on function modules and hence triggers object construction prematurely
module.exports = {
    constructor: constructor,
    inherit: inherit
};
