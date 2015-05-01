/**
 * Defines a card object.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var mangoPay = require('exports?mangoPay!../libraries/mangopay-kit.min.js'),
	
	Config = require('../config.js'),
	Model = require('../model.js');

function Card(options) {
    Model.call(this, options);
}

Card.prototype = new Model();

Card.prototype.didInitialize = function() {
    if (Config.isProduction() === true) {
        mangoPay.cardRegistration.baseURL = 'https://api.mangopay.com'; //Production
    } else {
        mangoPay.cardRegistration.baseURL = 'https://api.sandbox.mangopay.com';
    }
    mangoPay.cardRegistration.clientId = 'sharingear';
};

Card.prototype.registerCard = function(userID, cardData, callback) {
    this.get('/users/' + userID + '/cardobject', function(error, data) {
        if (error) {
            console.error('Error getting card object: ' + error);
            return;
        }
        mangoPay.cardRegistration.init({
            cardRegistrationURL: data.cardRegistrationURL,
            preregistrationData: data.preregistrationData,
            accessKey: data.accessKey,
            Id: data.id
        });
        mangoPay.cardRegistration.registerCard(cardData, function(result) {
            callback(null, result.CardId);
        }, function(result) {
            var error = 'Error registering card: ' + result.ResultMessage;
            console.error(error);
            callback(error);
        });
    });
};

module.exports = Card;
