/**
 * General model object with support for jQuery ajax.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
    $ = require('jquery');

function Model(options) {
    this.rootURL = '';
    this.data = null;
    this.token = null;
    _.extend(this, options);
}

Model.prototype.initialize = function() {
    if (this.didInitialize && typeof this.didInitialize == 'function') {
        this.didInitialize();
    }
};

Model.prototype.get = function(url, callback) {
    var encodedURL = encodeURI(this.rootURL + url);
    this._ajax({
        dataType: 'json',
        type: 'GET',
        url: encodedURL,
        error: function(jqXHR, textStatus, errorThrown) {
            console.error(jqXHR);
            console.error(textStatus);
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

Model.prototype.post = function(url, data, callback) {
    var encodedURL = encodeURI(this.rootURL + url);
    this._ajax({
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

Model.prototype.put = function(url, data, callback) {
    var encodedURL = encodeURI(this.rootURL + url);
    this._ajax({
        dataType: 'json',
        type: 'PUT',
        data: data,
        url: encodedURL,
        error: function(jqXHR, textStatus, errorThrown) {
            callback('Error executing PUT request: ' + errorThrown);
        },
        success: function(data) {
            if (data.error) {
                console.error(data.error);
                callback('Error putting resource to server: ' + data.error);
            } else {
                callback(null, data);
            }
        }
    });
};

Model.prototype.del = function() {

};

Model.prototype._ajax = function(options) {
    var model = this;
    if(this.token !== null) {
        options.beforeSend = function(jqXHR) {
            jqXHR.setRequestHeader('Authorization', 'Bearer ' + model.token);
        };
    }
    $.ajax(options);
};

module.exports = Model;
