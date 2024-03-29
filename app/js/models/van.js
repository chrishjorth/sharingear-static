/**
 * Defines a van item.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),
	
	Utilities = require('../utilities.js'),
	Model = require('../model.js'),
	App = require('../app.js');

function Van(options) {
    Model.call(this, options);
}

Van.prototype = new Model();

Van.prototype.didInitialize = function didInitialize() {
    if (this.data === null) {
        this.data = {
            id: null,
            van_type: '',
            model: '',
            description: '',
            images: '',
            price_a: '',
            price_b: '',
            price_c: '',
            currency: App.user.data.currency,
            accessories: null,
            address: '',
            postal_code: '',
            city: '',
            region: '',
            country: null,
            latitude: null,
            longitude: null,
            owner_id: null
        };
    }
    this.token = App.user.token;
};

Van.prototype.createVan = function createGear(callback) {
    var model = this,
        newVan = this.data,
        postData;

    postData = {
        van_type: newVan.van_type,
        model: newVan.model,
        description: newVan.description,
        images: newVan.images,
        accessories: newVan.accessories,
        price_a: newVan.price_a,
        price_b: newVan.price_b,
        price_c: newVan.price_c,
        currency: newVan.currency,
        address: newVan.address,
        postal_code: newVan.postal_code,
        city: newVan.city,
        region: newVan.region,
        country: newVan.country,
        latitude: newVan.latitude,
        longitude: newVan.longitude,
        owner_id: App.user.data.id
    };

    this.post('/users/' + App.user.data.id + '/vans', postData, function(error, data) {
        if (error) {
            if (callback && typeof callback === 'function') {
                callback(error);
            }
            return;
        }
        _.extend(model.data, data);
        if (callback && typeof callback === 'function') {
            callback(null);
        }
    });
};

/**
 * @param file: $('#upload-form input[type="file"]').get(0).files[0];
 * @param filename: The name of the file
 */
Van.prototype.uploadImage = function(file, filename, callback) {
    var model = this;
    //Get filename and secret from backend
    this.get('/users/' + App.user.data.id + '/newfilename/' + filename, function(error, data) {
        if (error) {
            if (callback && typeof callback === 'function') {
                callback('Error getting filename: ' + error);
            }
            return;
        }
        Utilities.ajajFileUpload('fileupload.php', data.secretProof, data.fileName, file, function(error, data) {
            var postData;
            if (error) {
                if (callback && typeof callback === 'function') {
                    callback('Error uploading file: ' + error);
                }
                return;
            }
            //Add image url to backend
            postData = {
                image_url: data.url
            };
            model.post('/users/' + App.user.data.id + '/vans/' + model.data.id + '/image', postData, function(error, images) {
                if (error) {
                    //TODO: In this case the image should be deleted from the server
                    if (callback && typeof callback === 'function') {
                        callback('Error uploading file: ' + error);
                    }
                    return;
                }
                model.data.images = images.images;
                callback(null, data.url);
            });
        });
    });
};

Van.prototype.save = function(callback) {
    var saveData = {
        subtype: this.data.subtype,
        brand: this.data.brand,
        model: this.data.model,
        description: this.data.description,
        images: this.data.images,
        price_a: this.data.price_a,
        price_b: this.data.price_b,
        price_c: this.data.price_c,
        currency: this.data.currency,
        delivery_price: this.data.delivery_price,
        delivery_distance: this.data.delivery_distance,
        address: this.data.address,
        postal_code: this.data.postal_code,
        city: this.data.city,
        region: this.data.region,
        country: this.data.country,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        accessories: JSON.stringify(this.data.accessories)
    };

    this.put('/users/' + App.user.data.id + '/vans/' + this.data.id, saveData, function(error, data) {
        if (error) {
            if (callback && typeof callback === 'function') {
                callback('Error saving gear: ' + error);
            }
            return;
        }

        if (callback && typeof callback === 'function') {
            callback(null, data);
        }
    });
};

Van.prototype.update = function(userID, callback) {
    var model = this;
    this.get('/vans/' + this.data.id, function(error, vans) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        _.extend(model.data, vans);
        callback(null);
    });
};

Van.prototype.getAvailability = function(callback) {
    if (App.user.data.id === null) {
        callback(null, {
            alwaysFlag: 0,
            availabilityArray: []
        });
        return;
    }
    this.get('/users/' + App.user.data.id + '/vans/' + this.data.id + '/availability', function(error, result) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        callback(null, result);
    });
};

/**
 * @param availabilityArray: List of start and end days in the format "YYYY-MM-DD HH:MM:SS".
 */
Van.prototype.setAvailability = function(availabilityArray, alwaysFlag, callback) {
    var postData;
    postData = {
        availability: JSON.stringify(availabilityArray),
        alwaysFlag: alwaysFlag
    };
    this.post('/users/' + App.user.data.id + '/vans/' + this.data.id + '/availability', postData, function(error) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        callback(null);
    });
};

module.exports = Van;
