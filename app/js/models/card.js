/**
 * Defines a card object.
 * @author: Chris Hjorth
 */
'use strict';

define(
	['underscore', 'utilities', 'model', 'mangopay'],
	function(_, Utilities, Model, MangoPay) { //MangoPay does not support AMD so we need to use global object mangoPay
		var didInitialize,
			registerCard;

		didInitialize = function() {
			mangoPay.cardRegistration.baseURL = "https://api.sandbox.mangopay.com";
			//mangoPay.cardRegistration.baseURL = "https://api.mangopay.com"; //Production
			mangoPay.cardRegistration.clientId = 'sharingear';
		};

		registerCard = function(userID, cardData, callback) {
			this.get('/users/' + userID + '/cardobject', function(error, data) {
				if(error) {
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


		return Model.inherit({
			didInitialize: didInitialize,
			registerCard: registerCard
        });
	}
);
