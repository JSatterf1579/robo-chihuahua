"use strict";
var request = require('request')

/**
 * User specific error and response handling
 * @callback responseCallback
 * @param {?String} error - Any error returned, 
 * @param {?String} body - The body of the response
 */

/**
 * Creates a new instance of the API manager for the given credentials
 * @constructor
 * @param {Object} config - The username and password for the user
 * @param {String} config.username
 * @param {String} config.password
 */
var RoboChihuahua = function(config) {
    if(!(this instanceof RoboChihuahua)) {
        return new RoboChihuahua(config)
    }
    this.username = config.username;
    this.password = config.password;
}

/**
 * Gets the inital token needed for login from the server
 * Must be called in order to perform login
 * @param {responseCallback}  callback - Handles caching the login token or any errors
 */
RoboChihuahua.prototype.getInitialToken = function(callback) {
    request({method: 'GET',
             uri: 'https://www.tacobell.com/api/sitecore/oauth/token',
             headers: {
                        'content-type': 'application/json', 
             },
        },
        function(error, response, body) {
            if(error) {
                        callback(error);
            } else {
                if(response.statusCode == 200) {
                    //callback(null, response.body)
                    var jsonBody = JSON.parse(body);
                    callback(null, jsonBody.access_token);
                } else {
                    callback('Unexpected reponse recieved from server: ' + response.statusCode);
                }
            }
        }
    );
};

/**
 * Logs in to the API using the username and password given at creation and the initial token
 * @param {responseCallback} callback - Caches the user token and error handling
 */
RoboChihuahua.prototype.getLoginToken = function(accessToken, callback) {
    var accessString = 'bearer ' + accessToken;
    request({method: 'POST',
             uri: 'https://prd-tac-api01.cfrprd.com/oauth/token',
             headers: {
                        'content-type': 'application/json', 
                        Authorization: accessString,
             },
             body: JSON.stringify({grant_type: 'password_grant',userName: this.username,'password': this.password}),
            },
            function (error, response, body) {
                if(error) {
                    callback(error);
                } else {
                    if(response.statusCode == 200) {
                        var jsonBody = JSON.parse(body);
                        callback(null, jsonBody.access_token);
                    } else {
                        callback('Unexpected reponse recieved from server: ' + response.statusCode);
                    }
                }
            }
    );
};

/**
 * Retrieves data associated with a previously placed or currently active order
 * @param {String} accessToken - An active login token
 * @param {String} orderId - An orderId in the form "<storeID>-<orderID>"
 * @param {responseCallback} callback - Deals with order information and errors
 */
RoboChihuahua.prototype.getOrderData = function(accessToken, orderId, callback) {
    request({method: 'GET',
             uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me/orders/' + orderId,
             headers: {
                        'content-type': 'application/json', 
                        Authorization: 'bearer ' + accessToken,
             },
            },
            makeDefaultRequestCallback(callback, 200)
    );
};

/**
 * Retrieves a user's account information
 * @param {String} accessToken - An active login token
 * @param {responseCallback} callback - Manipulates user data and error handling
 */
RoboChihuahua.prototype.getAccountData = function(accessToken, callback) {
    request({method: 'GET',
             uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me',
             headers: {
                        'content-type': 'application/json', 
                        Authorization: 'bearer ' + accessToken,
             },
            },
            makeDefaultRequestCallback(callback, 200)
    );
};

/**
 * Creates a new order using an already placed order as a base
 * This will create an order with a new ID and a storeId of '00'
 * @param {String} accessToken - An active login token
 * @param {String} orderID - The ID of the previous order in the format "<storeID>-<orderID>"
 * @param {responseCallback} callback - Manipulates order data and error handling
 */
RoboChihuahua.prototype.reorderOrder = function(accessToken, orderId, callback) {
    request({method: 'POST',
             uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me/orders/' + orderId + '/reorder',
             headers: {
                        'content-type': 'application/json', 
                        Authorization: 'bearer ' + accessToken,
             },
            },
            makeDefaultRequestCallback(callback, 201)
    )
};

/**
 * Moves an order to a new store.
 * Creates a new orderId linked to an order at the storeId passed in.
 * @param {String} accessToken - An active login token
 * @param {String} orderId - Identifier for the order. This is just the orderId, it does not have the storeId
 * @param {String} oldRestaurantId - Store that the order is currently connected to
 * @param {String} newRestaurantId - Target store for the move
 * @param {responseCallback} callback - Manipulates user data and error handling
 */
RoboChihuahua.prototype.moveOrder = function(accessToken, orderId, oldRestaurantId, newRestaurantId, callback) {
    request({
        method: 'POST',
        uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me/orders/' + oldRestaurantId + '-' + orderId + '/move',
        headers: {
            'content-type': 'application/json', 
            Authorization: 'bearer ' + accessToken,
        },
        body: JSON.stringify({'newRestaurantId' : newRestaurantId}),
        },
        makeDefaultRequestCallback(callback, 200)
    );
};

/**
 * Completes an order by providing billing information.
 * Will close the order to any changes, so be sure you are done.
 * @param {String} accessToken - An active login token
 * @param {String} restaurantId - Identifier for restaurant the order is linked to
 * @param {String} orderId - Order identfier (do not include restaurant ID)
 * @param {String} cardName - Name on the credit card being used
 * @param {String} zipCode - Zip code on card
 * @param {String} cvv - CVV code associated with card
 * @param {String} cardNumber - Credit card cardNumber
 * @param {String} expMonth - Month of card's expiration date
 * @param {String} expYear - Year of card's expiration date
 * @param {responseCallback} callback
 */
RoboChihuahua.prototype.completeOrder = function(accessToken, restaurantId, orderId, cardName, zipCode, cvv, cardNumber, expMonth, expYear, callback) {
    request({
        method: 'POST',
        uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me/orders/' + restaurantId + '-' + orderId + '/checkout',
        headers: {
            'content-type': 'application/json', 
            Authorization: 'bearer ' + accessToken,
        },
        body: JSON.stringify({
            paymentType: 'NewCreditCard',
            nameOnCard: cardName,
            postalCode: zipCode,
            'cvv': cvv,
            'cardNumber': cardNumber,
            expiration: {
                month: expMonth,
                year: expYear
            },
            savePaymentInformation: true
        }),
    },
    makeDefaultRequestCallback(callback, 200)
    );
};

function makeDefaultRequestCallback(callback, expectedResponse) {
    return function(error, response, body) {
        if(error) {
            callback(error)
        } else {
            if(response.statusCode == expectedResponse) {
                callback(null, body);
            } else {
                callback('Unexpected response recieved from server: ' + response.statusCode + body)
            }
        }
    }
};
    


module.exports = RoboChihuahua;


