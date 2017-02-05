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
                        'content-type': 'application-json', 
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

RoboChihuahua.prototype.getLoginToken = function(accessToken, username, password, callback) {
    request({method: 'POST',
             uri: 'https://prd-tac-api01.cfrprd.com/oauth/token',
             headers: {
                        'content-type': 'application-json', 
                        authorization: 'bearer' + accessToken,
             },
             body: JSON.stringify({grant_type: 'password_grant',userName: username,password: password,}),
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
    


module.exports = RoboChihuahua;