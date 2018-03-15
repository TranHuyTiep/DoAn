var express = require('express');
var router = express.Router();
var passport = require('passport');
var db_User = require('../../model/user')
var db_model = require('../../model/db_model')
var help = require('../../help/helper')

/* GET home page. */
router.route('/dangky')
    .get(function(req, res, next) {
        res.render('side/user/dangky');
    })
    .post(passport.authenticate('local-signup', {
        successRedirect : '/user/login',
        failureRedirect : '/user/dangky',
        failureFlash : true
    }))
;


/*Edit password*/
router.route('/edit')
    .get( function(req, res, next) {
        let Id_user = req.user
        db_User.searchUserID(Id_user).then(function (result) {
            delete result[0].password
            delete result[0].active
            delete result[0].Id_user
            delete result[0].id
            delete result[0].content
            console.log(result[0])
            res.render('side/user/edit',{data:result[0]});
        })
    })
    .post(function (req,res,next) {
        let data = req.body
        let Id_user = req.user
        db_User.updateUser(Id_user,data).then(function (result) {
            res.redirect('home');
        }).catch(function (error) {

        })

    })
;

router.route('/login')
    .get(function(req, res, next) {
        res.render('login/login');
    })
    .post(passport.authenticate('local-login', {
        successRedirect : '/admin/home',
        failureRedirect : '/login',
        failureFlash : true
    }))
;

router.route('/dangky/active/:id')
    .get(function (req,res,next) {
        var active = req.params.id
        db_User.searchUserActive(active).then(function (result) {
            if(result.length!=0){
                db_model.update('users',result[0].id,{active:1}).then(
                    res.redirect('/user/login')
                ).catch(function (error) {
                    res.redirect('/user/login')
                    console.log(error)
                })
            }else {
                res.redirect('/user/login')
            }
        })

    })

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});


module.exports = router;