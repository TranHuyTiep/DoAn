var express = require('express');
var helper = require('../../help/helper')
var router = express.Router();
var mqtt = require('mqtt')
var client  = mqtt.connect('http://broker.mqttdashboard.com:1883',{clientId:'clientId-N9IsDMQaBj',cleanSession:true});

/* GET home page. */
router.get(['/','/admin/home'], helper.isLoggedIn,function(req, res, next) {
    var connect = {
        id : "server",
        flag: "connect"
    }
    client.publish('huytiep/connectRPI',JSON.stringify(connect),{ qos: 1,retain:false})
    res.render('admin/home');

});

module.exports = router;
