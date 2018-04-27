
//TODO - create pool of connections rather than single connection
//TODO - add connection provider when working with pool
//support promises 
//support clusters 

const mysql = require('mysql');

var db;

/**
 * Provides connection to data base
 */
//TODO - replace hardcoded parameters by properties/yaml files
var connect = () => {
    db = mysql.createConnection({
        host : '127.0.0.1',
        database : 'venos',
        user : 'vladif',
        password : 'bokerTov1!'
    });

db.connect((err) => {
        if(err){
            console.log('Failed connect to DB : ', err.stack);
            throw new Error('Failed connect to DB : ', err.stack);
        }    
        console.log('Connected to db....');
  });
}

/**
 * Simple not parametrized query
 * @param {} sql 
 * @param {*} processResult 
 */
var query = (sql, processResult) => {
    console.log('Run query ...');
    db.query(sql, (error,result,fields)=> {
        if (error){
            console.log(`sql ${sql} has failed with error ${error}`);
        }
        processResult(result);
    }
    );      
}
/**
 * Parametrized query
 * @param {*} sql 
 * @param {*} parameters 
 * @param {*} processResult callback method for processing result.
 */
var queryWithParams = (sql, parameters, processResult) => {
    console.log('Run query ...');
    db.query(sql, parameters, (error,result,fields)=> {
        if (error){
            console.log(`sql ${sql} has failed with error ${error}`);
        }
        processResult(result);
    }
    );      
}

/**
 * Insert record into database
 * @param {*} sql 
 * @param {*} parameters 
 * @param {*} processResult 
 */
var command = (sql,parameters,processResult) => { 
    console.log('Run command ...');
    //open transaction?
    db.query(sql,parameters,(error,result) => {
        if (error) throw error;
        processResult(result);
    })   
}

/**
 * Insert within transaction
 * @param {} sql 
 * @param {*} parameters 
 * @param {*} processResult 
 */
var commandWithTransaction = (sql,parameters,processResult) => { 
    
}

/**
 * Terminates connection to database
 */

var close = () => {
    
    db.end( (err) => {
        db.destroy();
        //TODO - end doesn't work for some reason. investigatr it
        //throw new Error('Failed close connection to DB : ', err);
    });
    console.log('Connectio to db is closed....');   
}


module.exports = 
{ connect,
    query,
    queryWithParams,
    command,
    commandWithTransaction,
    close
}
             








