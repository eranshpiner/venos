
//TODO - create pool of connections rather than single connection
//TODO - add connection provider when working with pool
//TODO support promises 
//TODO support clusters 

const mysql = require('mysql');
const format = require('./sqlFormatter.js');

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
    password : 'bokerTov1!'
    //debug : true //TODO remove in the production
});

// db.connect((error) => {
//         if(error){
//             console.log('Failed connect to DB : ', error.stack);
//             throw error;
//         }    
//         console.log('Connected to db....');
//         //call here command or query

//   });
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
    console.log('Run query with params...');
    db.query(sql, parameters, (error,result,fields)=> {
        if (error){
            console.log(`sql ${sql} has failed with error ${error}`);
            processResult(error,undefined);
        }
        processResult(undefined, result);
        console.log('result length==>>>>>', result.length);
    });      
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
 * Insert command within transaction support
 * @param {*} sql 
 * @param {*} parameters 
 * @param {*} processResult 
 */
var commandWithTransaction = (commandsList, processResult) => { 
    console.log('start commandWithTransaction...');
    db.beginTransaction( (error) => {
        if (error){
            console.log('Failure to start transaction!', error.stack);
            throw error;
        }
    try {
        for (let i = 0; i < commandsList.length; i++) {
            command (commandsList[i].query, commandsList[i].parameters, (result)=>{
            });
        }
        db.commit( (error)=> {
            if (error){
                console.log('Failure to commit transaction! ', error.stack);
                throw error;
            }
        });
        //call callback
    processResult(undefined, result = {staus:'Success',code:0,component:'dbfacade.commandWithTransaction'}); 
    //console.log('end commandWithTransaction...'); 
    }
    catch(error) {
        console.log('Failure in transaction!. Rollback is going to be performed', error);
        
        db.rollback((error) => {
            if (error){
             console.log('Fatal error ! Rollback has failed!!', error);
             throw error;
            }
        });  
        processResult(error = {status:'Failure', code:-1, text:error.stack, component:'dbfacade.commandWithTransaction'}, undefined);  
    }
    }); //end begin transaction
}

/**
 * Prepare input for saving order record in the database
 * @param {} order 
 */
var prepareOrderRecord = (order) => {

    console.log('start prepareOrderRecord ....');

    var commandForTransaction = [];
    var orderRecord = format.orderRecordBuilder(order);
    var orderItems  = format.orderItemsBuilder(orderRecord.orderId, order);

    commandForTransaction.orderId = orderRecord.orderId;

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
    //return auto-generated order Id
    return {
        orderId: orderRecord.orderId,
        commands: commandForTransaction
    };
}

/**
 * Prepares input for saving order log in the data base
 * @param {*} order 
 * @param {*} submitOrderOutput 
 */
var prepareOrderLog = (order,submitOrderOutput, callback) => {
    console.log('start prepareOrderLog ....');
    var pos;
    queryWithParams('SELECT posId, posVendorId FROM venos.brandToPosvendor WHERE brandId=? AND brandLocationId=?',
    [order.brandId,order.brandLocationId],(error, result) => {
        
        if (error) {
            throw error;
        }

        pos = {
            posId : result[0].posId,
            posVendorId : result[0].posVendorId
        }
        console.log('pos==> ', pos);

        var commandForTransaction=[];
        var orderLog = format.orderLogBuilder(order, submitOrderOutput, pos);
    
        var orderLogCommand = {
            query: 'INSERT INTO venos.ORDERLOG SET ? ',
            parameters: orderLog
        }
        commandForTransaction.push(orderLogCommand);
        callback(undefined, commandForTransaction);
        console.log('end prepareOrderLog ....');
    });

}
/**
 * Prepares input for saving log (audit) in the data base
 * @param {*} order 
 * @param {*} orderLog 
 * @param {*} error 
 * @param {*} result 
 */
var prepareLog = (order,orderLog,error,result) => {
    console.log('start prepareLog ....');
    var commandForTransaction=[];
    var log = format.logBuilder(order,orderLog, error,result);
    var logCommand = {
        query : 'INSERT INTO venos.LOG SET ? ',
        parameters : log
    }
    commandForTransaction.push(logCommand);
    return commandForTransaction;

    console.log('end prepareLog ....');
}

var selectOrderDetails = (orderId) => {
    console.log('start prepareLog ....');
    var commandForTransaction=[];

    var logCommand = {
        query : 
        `SELECT * FROM venos.order INNER JOIN venos.orderItems ON order.orderId=orderItems.orderId
        WHERE order.orderId=?`,
        parameters : orderId
    }
    commandForTransaction.push(logCommand);
    return commandForTransaction;
    console.log('end prepareLog ....');
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
    prepareOrderLog,
    prepareLog,
    selectOrderDetails,
    close
}
             








