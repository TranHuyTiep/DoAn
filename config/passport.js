var pool  =  require('../config/database')
var db_model = require('../model/db_model')
var db_user = require('../model/user')
var crypto = require("crypto");
var help = require('../help/helper')
var sendMail = require('../help/send_mail')
var LocalStrategy   = require('passport-local').Strategy;
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.Id_user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db_user.searchUserID(id).then(function (result) {
            done(null, result[0].Id_user);

        }).catch(function (error) {
            done(error, null);
        })
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            let data  =  req.body
            let active = crypto.randomBytes(32).toString('hex');
            data.active  = active
            if(data.password==data.passwordVeri){
                delete data.gridCheck
                delete data.passwordVeri
                let Id_user = crypto.randomBytes(8).toString('hex');
                data.Id_user  = Id_user
                data.password = help.generateHash(data.password)
                db_user.searchUser(data.email).then(function (result) {
                    if(result.length==0){
                        db_model.insert('users',data).then(function (result) {
                            let newUser = new Object()
                            newUser.email = data.email
                            newUser.active = false
                            let link = help.fullUrl(req,'user/dangky/active/'+active)
                            sendMail.sendKichHoatDk(data.email,link,function (error,result) {
                                console.log(error)
                            })
                            return done(null, newUser,req.flash('signupMessage', 'Email kích hoạt đã được gửi.'));
                        }).catch(function (error) {
                            return done(error);
                        })
                    }else {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    }

                }).catch(function (error) {
                    return done(error);
                })
            }else {
                return done(false);
            }
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            let data  =  req.body
            db_user.searchUser(data.email).then(function (result) {
                if(result.length!=0){
                    if(result[0].active !=1 ){
                        return done(null, false, req.flash('signupMessage', 'User not active'));
                    }else {
                        if (!( help.validPassword(password,result[0].password))){
                            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                        }else {
                            return done(null, result[0]);
                        }
                    }
                }else {
                    return done(null, false, req.flash('signupMessage', 'No user found.'));
                }
            }).catch(function (error) {
                return done(error);
            })
        }));
};