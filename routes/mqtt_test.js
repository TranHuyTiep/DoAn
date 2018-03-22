var mqtt = require('mqtt')
const si = require('systeminformation');
var fs =  require('fs')
var ecc = require('../help/ECC/ECC')
var crypto = require('crypto-js')

var client  = mqtt.connect('http://broker.mqttdashboard.com:1883',{clientId:'huytiep',cleanSession:true})

client.on('connect', function (connack) {
    var templ = ''
    var macAuthen = ''
    var pKey = ''
    global.verifyServer = ''

    if (connack.sessionPresent) {
        console.log('Already subbed, no subbing necessary');
    } else {
        console.log('First session! Subbing.');
        client.subscribe('huytiep/connectRPI',{ qos: 1,retain:true })
        client.subscribe('huytiep/certServer',{ qos: 1,retain:false })
        client.subscribe('huytiep/verifyServer',{ qos: 1,retain:false })
    }

    client.on('message', function (topic, message) {
        var data = message.toString()
        switch(topic) {
            case "huytiep/connectRPI":
                var noncePI = Math.random().toString(16).substr(2, 8)
                templ = noncePI
                var certRPI = fs.readFileSync('cert_PI')
                certRPI = JSON.parse(certRPI.toString())

                var dataSend = {
                    noncePI:noncePI,
                    certRPI:certRPI.cert,
                    flag:'certRPI'
                }

                client.publish('huytiep/certRPI',JSON.stringify(dataSend),{ qos: 0,retain:false })
                break;

            case "huytiep/certServer":

                var certRPI = fs.readFileSync('cert_PI')
                certRPI = JSON.parse(certRPI.toString())
                var privateKeyRPI = ecc.create_key_to_cert(certRPI.private_key,certRPI.cert)
                var certServer = JSON.parse(data)
                var publicKeyServer = ecc.create_key_to_third_party(certServer.certServer)
                verifyServer = certServer

                pKey = ecc.scalar_mult(privateKeyRPI,ecc.x_to_Point(publicKeyServer))
                pKey = crypto.PBKDF2(pKey[0].toString(),certServer.nonceServer+templ).toString();

                macAuthen = JSON.stringify(certServer.certServer)+','
                    +JSON.stringify(certRPI.cert)+','
                    +certServer.nonceServer+','
                    +templ
                macAuthen  = crypto.HmacSHA256(macAuthen,pKey).toString();
                client.publish('huytiep/verifyPI',macAuthen,{ qos: 1,retain:false })
                break;

            case "huytiep/verifyServer":
                if(data==macAuthen){
                    console.log(verifyServer.certServer)
                    setInterval(function () {
                        var date = new Date()

                        si.currentLoad(function (data) {
                            var data_list = {data: Math.floor(data.currentload)}
                            data_list = JSON.stringify(data_list)
                            // console.log(data_list)
                            data_list = crypto.AES.encrypt(data_list,pKey).toString();
                            client.publish('huytiep/data',data_list)
                        })
                    },1000)
                    // client.publish('huytiep/data','aaa')

                }
                break;
            default:
                false;
        }
    })
})


