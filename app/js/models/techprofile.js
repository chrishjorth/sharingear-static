/**
 * Defines a tech profile item.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';


var _ = require('underscore'),

    App = require('../app.js'),
    Model = require('../model.js');

function TechProfile(options) {
    Model.call(this, options);
}

TechProfile.prototype = new Model();

TechProfile.prototype.didInitialize = function didInitialize() {
    if (this.data === null) {
        this.data = {
            id: null,
            roadie_type: '',
            about: '',
            currently: '',
            genres: '',
            experience: 5, //1=A+, 2=A, 3=B, 4=C, 5=D
            xp_years: '',
            tours: '',
            companies: '',
            bands: '',
            image: '',
            price_a: '',
            price_b: '',
            price_c: '',
            currency: App.user.data.currency,
            address: '',
            postal_code: '',
            city: '',
            region: '',
            country: '',
            latitude: null,
            longitude: null,
            owner_id: null,
            techprofilelist: null
        };
    }
    this.token = App.user.token;
};

TechProfile.prototype.createTechProfile = function createGear(callback) {
    var model = this,
        newTechProfile = this.data,
        postData;

    postData = {
        roadie_type: newTechProfile.roadie_type,
        about: newTechProfile.about,
        currently: newTechProfile.currently,
        genres: newTechProfile.genres,
        experience: newTechProfile.experience,
        xp_years: newTechProfile.xp_years,
        tours: newTechProfile.tours,
        companies: newTechProfile.companies,
        bands: newTechProfile.bands,
        price_a: newTechProfile.price_a,
        price_b: newTechProfile.price_b,
        price_c: newTechProfile.price_c,
        currency: newTechProfile.currency,
        address: newTechProfile.address,
        postal_code: newTechProfile.postal_code,
        city: newTechProfile.city,
        region: newTechProfile.region,
        country: newTechProfile.country,
        latitude: newTechProfile.latitude,
        longitude: newTechProfile.longitude,
        owner_id: App.user.data.id,
        techprofilelist: newTechProfile.techprofilelist
    };

    this.post('/users/' + App.user.data.id + '/roadies', postData, function(error, data) {
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

TechProfile.prototype.save = function(callback) {
    var saveData = {
        about: this.data.about,
        currently: this.data.currently,
        genres: this.data.genres,
        experience: this.data.experience,
        xp_years: this.data.xp_years,
        tours: this.data.tours,
        companies: this.data.companies,
        bands: this.data.bands,
        price_a: this.data.price_a,
        price_b: this.data.price_b,
        price_c: this.data.price_c,
        currency: this.data.currency,
        address: this.data.address,
        postal_code: this.data.postal_code,
        city: this.data.city,
        region: this.data.region,
        country: this.data.country,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        techprofilelist: this.data.techprofilelist
    };

    this.put('/users/' + App.user.data.id + '/roadies/' + this.data.id, saveData, function(error, data) {
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

TechProfile.prototype.update = function(userID, callback) {
    var model = this;
    this.get('/roadies/' + this.data.id, function(error, techProfile) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        _.extend(model.data, techProfile);
        callback(null);
    });
};

TechProfile.prototype.getAvailability = function(callback) {
    if (App.user.data.id === null) {
        callback(null, {
            alwaysFlag: 0,
            availabilityArray: []
        });
        return;
    }
    this.get('/users/' + App.user.data.id + '/roadies/' + this.data.id + '/availability', function(error, result) {
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
TechProfile.prototype.setAvailability = function(availabilityArray, alwaysFlag, callback) {
    var postData;
    postData = {
        availability: JSON.stringify(availabilityArray),
        alwaysFlag: alwaysFlag
    };
    this.post('/users/' + App.user.data.id + '/roadies/' + this.data.id + '/availability', postData, function(error) {
        if (error) {
            console.error(error);
            callback(error);
            return;
        }
        callback(null);
    });
};

module.exports = TechProfile;
