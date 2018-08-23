//TODO - create pool of connections rather than single connection
//TODO - add connection provider when working with pool
//TODO support clusters

const mysql = require('mysql');

const conf = require('../../config/conf');
const log = require('../util/log')('DB');
const format = require('./sqlFormatter');

let db;

/**
 * Initializes connection to data base
 */
function init() {
  db = mysql.createConnection(conf.get('db'));
  db.on('error', (err) => {
    log.error('A fatal error has occurred.', err);
  });
}

/**
 * Simple not parametrized query
 * @param {} sql
 */
function query(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (error, result, fields) => {
        if (error) {
          log.error(`sql ${sql} has failed with error ${error}`);
          reject(error)
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Parametrized query
 * @param {*} sql
 * @param {*} parameters
 */
function queryWithParams(sql, parameters) {
  return new Promise((resolve, reject) => {
    db.query(sql, parameters, (error, result, fields) => {
      if (error) {
        log.error(`sql ${sql} has failed with error ${error}`);
        reject(error);
      } else {
        log.info('result length==>>>>>', result.length);
        resolve(result);
      }
    });
  })

}

/**
 * Insert command within transaction support
 * @param {*} commandsList
 */
function commandWithTransaction(commandsList) {
  return new Promise((resolve, reject) => {
    log.info('Starting transaction...');
    db.beginTransaction((error) => {
      if (error) {
        log.error('Failure to start transaction!', error);
        reject(error);
        return;
      }
      const queries = commandsList.map(command => queryWithParams(command.query, command.parameters));

      function rollback() {
        db.rollback((error) => {
          if (error) {
            log.error('Fatal error ! Rollback has failed!!', error);
            reject(error);
          } else {
            reject({status: 'Failure', code: -1, text: error.message, component: 'dbfacade.commandWithTransaction'});
          }
        });
      }

      Promise.all(queries)
        .then(() => {
          db.commit((error) => {
            if (error) {
              log.error('Failure in transaction!. Rollback is going to be performed', error);
              rollback();
            } else {
              log.info('Successfully ran transaction.');
              resolve({status: 'Success', code: 0, component: 'dbfacade.commandWithTransaction'});
            }
          });
        })
        .catch((error) => {
        log.error('Error running one of the queries, rolling back...', error);
        rollback();
        });
    });
  });
}

/**
 * Prepare input for saving order record in the database
 * @param {} order
 */
function prepareOrderRecord(order) {
  const commandForTransaction = [];

  const orderRecord = format.orderRecordBuilder(order);
  commandForTransaction.orderId = orderRecord.orderId;
  commandForTransaction.push({
    query: 'INSERT INTO venos.ORDER SET ?',
    parameters: orderRecord,
  });

  // add items
  const orderItems = format.orderItemsBuilder(orderRecord.orderId, order);
  orderItems.forEach(item => {
    commandForTransaction.push({
      query: 'INSERT INTO venos.ORDERITEMS SET ?',
      parameters: item,
    })
  });

  return {
    orderId: orderRecord.orderId,
    commands: commandForTransaction,
  };
}

/**
 * Prepares input for saving order log in the data base
 * @param {*} order
 * @param {*} submitOrderOutput
 */
async function prepareOrderLog(order, transaction) {
  log.info('Preparing order log...');
  let pos;
  try {
    const result = await queryWithParams('SELECT posId, posVendorId FROM venos.brandToPosvendor WHERE brandId=? AND brandLocationId=?',
      [order.brandId, order.brandLocationId]);
    if (!result || !result[0] || !result[0].posId || result[0].posVendorId) {
      throw new Error('posId/posVendorId not found!');
    }
    pos = {
      posId: result[0].posId,
      posVendorId: result[0].posVendorId
    };
  } catch (error) {
    log.error('Failed to get posId/posVendorId', error);
    throw error;
  }

  return [{
    query: 'INSERT INTO venos.ORDERLOG SET ? ',
    parameters: format.orderLogBuilder(order, transaction, pos),
  }];
}

/**
 * Prepares input for saving log (audit) in the data base
 * @param {*} order
 * @param {*} orderLog
 * @param {*} error
 * @param {*} result
 */
function prepareLog(order, orderLog, error, result) {
  return [{
    query: 'INSERT INTO venos.LOG SET ? ',
    parameters: format.logBuilder(order, orderLog, error, result)
  }];
}

function selectOrderDetails(orderId) {
  return [{
    query: 'SELECT * FROM venos.ORDER INNER JOIN venos.ORDERITEMS ON ORDER.orderId=ORDERITEMS.orderId WHERE ORDER.orderId=?',
    parameters: orderId,
  }];
}

/**
 * Terminates connection to database
 */
function close() {
  db.end((error) => {
    db.destroy();
    log.info('Connection to db is closed....');
    //TODO - end doesn't work for some reason. investigatr it
    //throw new Error('Failed close connection to DB : ', err);
  });
}

module.exports = {
  init,
  query,
  queryWithParams,
  commandWithTransaction,
  prepareOrderRecord,
  prepareOrderLog,
  prepareLog,
  selectOrderDetails,
  close,
};
             








