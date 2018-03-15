var nodemailer = require('nodemailer');

function send_Mail(email,text,subject,callback) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'huytiep1995@gmail.com',
            pass: 'huytiep2521995'
        }
    });
    var mail = {
        from: "<huytiep1995@gmail.com>",
        to:email,
        subject: subject,
        text:text
    }

    transporter.sendMail(mail, function(error, response){           //end mail
        if(error){
            callback(error)
        }else{
            callback(error,response)
        }
        transporter.close();
    });
}



function send_file(email,subject,file,text,callback) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'huytiep1995@gmail.com',
            pass: 'huytiep2521995'
        }
    });
    var mail = {
        from: "<huytiep1995@gmail.com>",
        to: email,
        subject: subject,
        text:text,
        attachments: [
            {   // file on disk as an attachment
                filename: 'private_key.txt',
                path: file // stream this file
            }
        ]
    }

    transporter.sendMail(mail, function(error, response){           //end mail
        if(error){
            callback(error)
        }else{
            callback(error,response)
        }
        transporter.close();
    });
}



function sendKichHoatDk(email,link,callback) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'huytiep1995@gmail.com',
            pass: 'huytiep2521995'
        }
    });
    var mail = {
        from: "<huytiep1995@gmail.com>",
        to:email,
        subject: 'Xác thực đăng ký.',
        text:"Kích hoạt tài khoản" +
        "Link:" + link
    }

    transporter.sendMail(mail, function(error, response){           //end mail
        if(error){
            callback(error)
        }else{
            callback(error,response)
        }
        transporter.close();
    });
}


module.exports.send_Mail = send_Mail
module.exports.send_file = send_file
module.exports.sendKichHoatDk = sendKichHoatDk