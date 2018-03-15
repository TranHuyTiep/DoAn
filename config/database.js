var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 100,
    host: "localhost",
    user: "root",
    password: "",
    database: "ca_con"

});

module.exports = pool