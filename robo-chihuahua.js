"use strict";
var request = require('request')

var RoboChihuahua = function(config) {
    if(!(this instanceof RoboChihuahua)) {
        return new RoboChihuahua(config)
    }
    this.username = config.username;
    this.password = config.password;
}


module.exports = RoboChihuahua;