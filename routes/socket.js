var mqtt = require('mqtt');
var client  = mqtt.connect('http://broker.mqttdashboard.com:1883',{clientId:'huytiep1',cleanSession:true});
var fs = require('fs');
var ecc = require('../help/ECC/ECC')
var crypto = require('crypto-js')
client.subscribe('huytiep/certRPI',{ qos: 1,retain:false })

module.exports = function (socket) {
    global.socket_io = socket
    global.valueVerify = false;
    global.verifyRPI = ''
    client.on('connect', function (connack) {

        if (connack.sessionPresent) {
            console.log('Already subbed, no subbing necessary');

        } else {
            console.log('First session! Subbing.');
            client.subscribe('huytiep/certRPI',{ qos: 1,retain:false })
            client.subscribe('huytiep/verifyPI',{ qos: 1,retain:false })
            client.subscribe('huytiep/data',{ qos: 1,retain:false })
            // console.log(socket)
            var templ = ''
            var macAuthen = ''
            var pKey = ''

            client.on('message', function (topic, message) {
                var data = message.toString()
                switch(topic) {
                    case "huytiep/certRPI":
                        var nonceServer = Math.random().toString(16).substr(2, 8)
                        templ = nonceServer
                        var certServer = fs.readFileSync('routes/cert_Server')
                        certServer = JSON.parse(certServer.toString())
                        var privateServer = ecc.create_key_to_cert(certServer.private_key,certServer.cert)

                        var dataSend = {
                            nonceServer:nonceServer,
                            certServer:certServer.cert,
                            flag:'certServer'
                        }

                        client.publish('huytiep/certServer',JSON.stringify(dataSend),{ qos: 1,retain:false })
                        var certRPI = JSON.parse(data);
                        verifyRPI = certRPI;
                        var publicKeyRPI = ecc.create_key_to_third_party(certRPI.certRPI)

                        pKey = ecc.scalar_mult(privateServer,ecc.x_to_Point(publicKeyRPI))
                        pKey = crypto.PBKDF2(pKey[0].toString(),templ+certRPI.noncePI).toString();
                        macAuthen = JSON.stringify(certServer.cert)+','
                            +JSON.stringify(certRPI.certRPI)+','
                            +templ+','
                            +certRPI.noncePI
                        macAuthen  = crypto.HmacSHA256(macAuthen,pKey).toString()
                        client.publish('huytiep/verifyServer',macAuthen,{ qos: 1,retain:false })
                        break;

                    case "huytiep/verifyPI":
                        var verifyPI = data
                        if(verifyPI==macAuthen){
                            console.log(verifyRPI.certRPI)
                            valueVerify = true
                        }else {
                            valueVerify = false
                        }
                        break;

                    case "huytiep/data":
                        if(valueVerify){
                            // console.log(data)
                            var bytes  = crypto.AES.decrypt(data,pKey);
                            var decryptedData = (bytes.toString(crypto.enc.Utf8));
                            // console.log(decryptedData)
                            socket_io.emit('cpu_load',JSON.parse(decryptedData))
                        }
                        break;
                    default:
                        false;
                }
            })
        }
    })
};





