var mqtt = require('mqtt');
var client  = mqtt.connect('http://broker.mqttdashboard.com:1883',{clientId:'huytiep1',cleanSession:true});
var fs = require('fs');
var ecc = require('../help/ECC/ECC')
var crypto = require('crypto-js')
var config = require('../config/config')

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
                        var strCertServer = fs.readFileSync(config.root_dir+config.jwt.cert).toString()
                        var certServer  = crypto.AES.decrypt(strCertServer, config.jwt.password);
                        var plaintext = certServer.toString(crypto.enc.Utf8);
                        certServer = JSON.parse(plaintext)

                        var strR = fs.readFileSync(config.root_dir+config.jwt.r).toString()
                        var rServer  = crypto.AES.decrypt(strR, config.jwt.password);
                        var plaintext = rServer.toString(crypto.enc.Utf8);
                        rServer = JSON.parse(plaintext)

                        var privateServer = ecc.create_key_to_cert(rServer,certServer)

                        var dataSend = {
                            nonceServer:nonceServer,
                            certServer:certServer,
                            flag:'certServer'
                        }

                        client.publish('huytiep/certServer',JSON.stringify(dataSend),{ qos: 1,retain:false })
                        var certRPI = JSON.parse(data);
                        verifyRPI = certRPI;
                        var publicKeyRPI = ecc.create_key_to_third_party(certRPI.certRPI)

                        pKey = ecc.scalar_mult(privateServer,ecc.x_to_Point(publicKeyRPI))
                        pKey = crypto.PBKDF2(pKey[0].toString(),templ+certRPI.noncePI).toString();
                        macAuthen = JSON.stringify(certServer)+','
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


//
// //
// //
// // // Encrypt
// var string = fs.readFileSync(config.root_dir+config.jwt.r).toString()
// // var ciphertext = crypto.AES.encrypt('115384283877462498079275081838378639864540036102372508519365666259500077010086', 'Aa23456');
// // console.log(ciphertext.toString())
// // // Decrypt
// var r  = crypto.AES.decrypt(string, 'Aa123456');
// var plaintext = r.toString(crypto.enc.Utf8);
// console.log(JSON.parse(plaintext))
// var cert  = CryptoJS.AES.decrypt('U2FsdGVkX1/FwwG/qNIxdnLhkBBQiPoSiGKgtY/zdf6vz1YeLWfBTg6iTKCPpah0G+1EqT9n3hxBsxEJB3sLQ1dHA7TDtyIUaZlqDAUlMYvYmobrAlQzo+0fbCbP0E9IRmLmnzPWsMqCiRVXW3K9MTXbzOzcj/I9R0zkqUOpM98huB7NbV0Cj+kj3irWep7baSUD4KGWWl0WKzF8aIjOjpxc92+1uUKs+iayy+JDlNwdH8+aho5J/JTvNsgYR5wD07r+73KPrt6H2uvYVmBi5biR1K0Rwnoroc43zp//uIM3yi5c3EORUyPR6TO/SwvSP0D8JrasZkQ2Rzrv+bXpe8/dldZSgCgB3FFLqcD9JbI4veyByUc0Z6sCWoPv+rk3HEKG3sUUO67wsrv4oyPkGWBRCs1tmFhw6e6RYZtRsIU=', 'Aa123456');
// var plaintext_cert = cert.toString(CryptoJS.enc.Utf8);
//
// var key = ecc.create_key_to_cert(plaintext,JSON.parse(plaintext_cert))
// console.log(key);


