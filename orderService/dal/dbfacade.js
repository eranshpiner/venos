
//TODO - create pool of connections rather than single connection
//TODO - add connection provider when working with pool
//TODO support promises 
//TODO support clusters 

const mysql = require('mysql');

//db connection
var db;

/**
 * Initializes connection to data base
 */

//TODO - replace hardcoded parameters by properties/yaml files

var init = () => {
    db = mysql.createConnection({
    host : '127.0.0.1',
    database : 'venos',
    user : 'vladif',
    password : 'bokerTov1!',
    debug : true //TODO remove in the production
});

db.connect((error) => {
        if(error){
            console.log('Failed connect to DB : ', error.stack);
            throw error;
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
            throw error;
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
            throw error;
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
    console.log('Run parametrized command ...');
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
var commandWithTransaction = (commandsList,processResult) => { 
    console.log('start commandWithTransaction...')
    db.beginTransaction((error) => {
        console.log('Failure to open transaction!', error);
        throw error;
    });

    try {
        for (let i=0; i < commandsList.length; i++) {
            command (commandsList[i].query, commandsList[i].parameters, (result)=>{
                console.log('running command : ', commandsList[i]);
            })
        }//for

        db.commit( (error)=> {
            throw error;
        });
    } 
    catch(error) {
        log.console('Failure in transaction!. Rollback is going to be performed', error);
        db.rollback((error)=> {
            console.log('Fatal error ! Rollback has failed!!', error);
            throw error;
        });  
    }
}

var prepareOrderRecord = () => {
    console.log('start prepareOrderRecord ....');
    var commandForTransaction=[];

    var orderCommand = {
        query:'INSERT INTO venos.ORDER SET ?',
        parameters:orderRecord
    }
    commandForTransaction.push(orderCommand);

    for (i=0; i < orderItems.length; i++){
        var orderItem = {
            query:'INSERT INTO venos.orderItems SET ?',
            parameters:orderItems[i]
        } 
        commandForTransaction.push(orderItem);
    }
    console.log('end prepareOrderRecord ....');
    return commandForTransaction;
}

/**
 * Terminates connection to database
 */

var close = () => {
    db.end( (error) => {
        db.destroy();
        //TODO - end doesn't work for some reason. investigatr it
        //throw new Error('Failed close connection to DB : ', err);
    });
    console.log('Connectio to db is closed....');   
}


module.exports = 
{   init,
    query,
    queryWithParams,
    command,
    commandWithTransaction,
    prepareOrderRecord,
    close
}
             








