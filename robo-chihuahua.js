"use strict";
var request = require('request')

var RoboChihuahua = function(config) {
    if(!(this instanceof RoboChihuahua)) {
        return new RoboChihuahua(config)
    }
    this.username = config.username;
    this.password = config.password;
}

//Retrieve initial access token
RoboChihuahua.prototype.getInitialToken = function(callback) {
    request({method: 'GET',
             uri: 'https://www.tacobell.com/api/sitecore/oauth/token',
             headers: {
                        'content-type': 'application/json', 
             }

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
    )
};

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
    )
};

RoboChihuahua.prototype.getOrderData = function(accessToken, orderId, callback) {
    request({method: 'GET',
             uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me/orders/' + orderId,
             headers: {
                        'content-type': 'application/json', 
                        Authorization: 'bearer ' + accessToken,
             },
            },
            makeDefaultRequestCallback(callback, 200)
    )
};

RoboChihuahua.prototype.getAccountData = function(accessToken, callback) {
    request({method: 'GET',
             uri: 'https://prd-tac-api01.cfrprd.com/account-management/v1/users/me',
             headers: {
                        'content-type': 'application/json', 
                        Authorization: 'bearer ' + accessToken,
             },
            },
            makeDefaultRequestCallback(callback, 200)
    )
};

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
