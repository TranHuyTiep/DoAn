var bcrypt   = require('bcrypt-nodejs');

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login/');
}

function check_login(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())                      //kiem tra da lohin chua
        res.redirect('/user/dkyic');
    // if they aren't redirect them to the home page
    return next();
}

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
function validPassword(password,hash) {
    return bcrypt.compareSync(password, hash);
};

function fullUrl(req,url) {
    if(!url){
        return ('')
    }else {
        return (req.protocol+'://'+req.get('host')+'/'+url)
    }
}

module.exports.isLoggedIn = isLoggedIn
module.exports.check_login = check_login
module.exports.generateHash = generateHash
module.exports.validPassword = validPassword
module.exports.fullUrl =     fullUrl

