"use strict";
var request = require('request')

var RoboChihuahua = function(config) {
    if(!(this instanceof RoboChihuahua)) {
        return new RoboChihuahua(config)
    }
    this.username = config.username;
    this.password = config.password;
}

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
    );
}


module.exports = RoboChihuahua;