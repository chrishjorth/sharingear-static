/**
 * Defines a card object.
 * @author: Chris Hjorth
 */

/*jslint node: true */
'use strict';

var mangoPay = require('exports?mangoPay!../libraries/mangopay-kit.min.js'),
	
	Config = require('../config.js'),
	Model = require('../model.js'),

    didInitialize,
    registerCard;

didInitialize = function() {
    if (Config.isProduction() === true) {
        mangoPay.cardRegistration.baseURL = 'https://api.mangopay.com'; //Production
    } else {
        mangoPay.cardRegistration.baseURL = 'https://api.sandbox.mangopay.com';
    }
    mangoPay.cardRegistration.clientId = 'sharingear';
};

registerCard = function(userID, cardData, callback) {
    this.get('/users/' + userID + '/cardobject', function(error, data) {
        if (error) {
            console.log('Error getting card object: ' + error);
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
            console.log(error);
            console.log(result);
            callback(error);
        });
    });
};


module.exports = Model.inherit({
    didInitialize: didInitialize,
    registerCard: registerCard
});
