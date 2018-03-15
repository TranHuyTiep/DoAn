var pool = require('../config/database')

function db_model() {}

/**
 * Get all data in table
 * @param table : string
 * @returns {Promise}
 */
function getAll (table) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection) {
            let query = "SELECT * FROM ?? "
            connection.query(query,(table),function (error,result) {
                if (error){
                    reject(error)
                }else {
                    resolve(result)
                    connection.release();
                }
            })
        });
    })
}

db_model.prototype.getAll = async function (table) {
    try{
        let result = await getAll(table);
        return result
    }catch(error) {
        console.log(error)
    }
}


/**
 * get data with Condition
 * @param table : string
 * @param where : {id:value}
 * @returns {Promise}
 */


function getId(table,id) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection) {
            let query = 'SELECT * FROM ?? WHERE id = ?' ;
            connection.query(query,[table,id],function (error,result) {
                if (error){
                    reject(error)
                }else {
                    resolve(result)
                    connection.release();
                }
            })
        })
    })
}

db_model.prototype.getId= async function (table,id) {
    try{
        let result = await getId(table,id);
        return result
    }catch(error) {
        console.log(error)
    }
}

/**
 * them du lieu vao bang
 * @param table
 * @param data
 * @returns {Promise}
 */
function insert(table,data) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection) {
            let query = 'INSERT INTO ?? SET ?';
            let set_auto="ALTER TABLE ?? AUTO_INCREMENT = 1";
            connection.query(set_auto,[table],function (error,result) {
                if (error){
                    reject(error)
                }else {
                    connection.query(query,[table,data],function (error,result) {
                        if (error){
                            reject(error)
                        }else {
                            resolve(error,result)
                            connection.release();
                        }
                    })
                }
            })
        })
    })
}

db_model.prototype.insert = async function (table,data) {
    try{
        let result = await insert(table,data);
        return result
    }catch(error) {
        console.log(error)
    }
}

/**
 * update data
 * @param table
 * @param id
 * @param data
 * @returns {Promise}
 */
function update(table,id,data) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection) {
            var query = "UPDATE ?? SET ? WHERE id = ?";
                    connection.query(query,[table,data,id],function (error,result) {
                        if (error){
                            reject(error)
                        }else {
                            resolve(error,result)
                            connection.release();
                        }
                    })
            })
    })
}

db_model.prototype.update = async function (table,id,data) {
    try{
        let result = await update(table,id,data);
        return result
    }catch(error) {
        console.log(error)
    }
}

/**
 * delete table with id
 * @param table
 * @param id
 * @returns {Promise}
 */
function deleteId(table,id) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection) {
            let query = 'DELETE FROM ?? WHERE id=?';
            connection.query(query,[table,id],function (error,result) {
                if (error){
                    reject(error)
                }else {
                    resolve(error,result)
                    connection.release();
                }
            })
        })
    })
}

db_model.prototype.deleteId = async function (table,id) {
    try{
        let result = await deleteId(table,id);
        return result
    }catch(error) {
        console.log(error)
    }
}

var model = new db_model()
module.exports = model

