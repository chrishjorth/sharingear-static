/**
 * Defines a gear item.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var _ = require('underscore'),

    Utilities = require('../utilities.js'),
    Model = require('../model.js'),
    App = require('../app.js');

function Gear(options) {
    Model.call(this, options);
}

Gear.prototype = new Model();

Gear.prototype.didInitialize = function didInitialize() {
    if (this.data === null) {
        this.data = {
            id: null,
            gear_type: '',
            subtype: '',
            brand: '',
            model: '',
            description: '',
            images: '',
            price_a: '',
            price_b: '',
            price_c: '',
            currency: App.user.data.currency,
            delivery_price: '',
            delivery_distance: '',
            accessories: null,
            address: '',
            postal_code: '',
            city: '',
            region: '',
            country: '',
            latitude: null,
            longitude: null,
            owner_id: null
        };
    }
};

Gear.prototype.createGear = function createGear(user, callback) {
    var model = this,
        newGear = this.data,
        postData;

    postData = {
        gear_type: newGear.gear_type,
        subtype: newGear.subtype,
        brand: newGear.brand,
        model: newGear.model,
        description: newGear.description,
        images: newGear.images,
        accessories: newGear.accessories,
        price_a: newGear.price_a,
        price_b: newGear.price_b,
        price_c: newGear.price_c,
        currency: newGear.currency,
        delivery_price: newGear.delivery_price,
        delivery_distance: newGear.delivery_distance,
        address: newGear.address,
        postal_code: newGear.postal_code,
        city: newGear.city,
        region: newGear.region,
        country: newGear.country,
        latitude: newGear.latitude,
        longitude: newGear.longitude,
        owner_id: user.data.id
    };

    this.post('/gear', postData, function(error, data) {
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
Gear.prototype.uploadImage = function(file, filename, userID, callback) {
    var model = this;

    console.log('Model uploading image');

    //Get filename and secret from backend
    this.get('/users/' + userID + '/newfilename/' + filename, function(error, data) {
        if (error) {
            if (callback && typeof callback === 'function') {
                callback('Error getting filename: ' + error);
            }
            return;
        }

        console.log('got filename');

        Utilities.ajajFileUpload('fileupload.php', data.secretProof, data.fileName, file, function(error, data) {
            var postData;
            if (error) {
                if (callback && typeof callback === 'function') {
                    callback('Error uploading file: ' + error);
                }
                return;
            }

            console.log('File uploaded, sending url to backend...');

            //Add image url to backend
            postData = {
                user_id: userID,
                gear_id: model.data.id,
                image_url: data.url
            };
            model.post('/gear/image', postData, function(error, images) {
                if (error) {
                    //TODO: In this case the image should be deleted from the server
                    if (callback && typeof callback === 'function') {
                        callback('Error uploading file: ' + error);
                    }
                    return;
                }

                console.log('Backend updated...');

                model.data.images = images.images;
                callback(null, data.url);
            });
        });
    });
};

Gear.prototype.save = function(userID, callback) {
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

    this.put('/users/' + userID + '/gear/' + this.data.id, saveData, function(error, data) {
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

Gear.prototype.update = function(userID, callback) {
    var model = this;
    this.get('/gear/' + this.data.id, function(error, gear) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        _.extend(model.data, gear);
        callback(null);
    });
};

Gear.prototype.getAvailability = function(userID, callback) {
    if (userID === null) {
        callback(null, {
            alwaysFlag: 0,
            availabilityArray: []
        });
        return;
    }
    this.get('/users/' + userID + '/gear/' + this.data.id + '/availability', function(error, result) {
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
Gear.prototype.setAvailability = function(userID, availabilityArray, alwaysFlag, callback) {
    var postData;
    postData = {
        availability: JSON.stringify(availabilityArray),
        alwaysFlag: alwaysFlag
    };
    this.post('/users/' + userID + '/gear/' + this.data.id + '/availability', postData, function(error) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        callback(null);
    });
};

module.exports = Gear;
