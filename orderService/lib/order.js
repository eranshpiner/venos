const axios = require('axios');

const beecomm = require('./providers/beecomm/beecomm');
const errors = require('./errors/errors');
const OrderError = require('./errors/OrderError');
const dal = require('./dal/dbfacade');
const validator = require('./util/validator');
const format = require('./dal/sqlFormatter');
const log = require('./util/log')('OrderAPI');

const QUERIES = {
  GET_ORDER_BY_ID: 'SELECT * FROM venos.ORDER INNER JOIN venos.ORDERITEMS ON ORDER.orderId=ORDERITEMS.orderId WHERE ORDER.orderId=?',
};

const convServiceNotifyEndpoint = 'https://venos-stg.natiziv.com/notification/order';

const orderToConversionContext = {};

async function getCheckOutDetails(jwtToken) {
  const order = validator.validateAndExtractJwt(jwtToken);
  if (order === null) {
    log.error('Invalid JWT', {jwtToken});
    throw new OrderError(errors.INVALID_JWT);
  } else {
    delete order.iat;
  }

  if (!validator.validateInternalOrder(order)) {
    log.error('Invalid order', { order });
    throw new OrderError(errors.INVALID_ORDER);
  }

  // the order is meant to include the identifiers of the brand to which the order
  // is supposed to be sent - for now, we explicitly assign it the identifiers of
  // "nini-hatchi" brand - e.g. the "Venos" indentifier for the restautrant (1001)
  // and the "BeeComm" identifier for the branch (58977cd2436ede4d0ebd7175)
  //order.brandId = "vns1001";
  //order.brandLocationId = "58977cd2436ede4d0ebd7175";

  // create and save 'orderRecord' to get an 'orderId'
  const orderReq = dal.prepareOrderRecord(order);
  const orderId = orderReq.orderId;
  try {
    const result = await dal.commandWithTransaction(orderReq.commands);
    log.info(`an 'orderRecord' for order ${orderId} was saved to db... result is: ${result}`);
  } catch (error) {
    log.error("failed to create an 'orderRecord' in db for order %s...", {error, order});
    throw new OrderError(errors.DB_ERROR);
  }

  if (order.conversationContext !== null) {
    orderToConversionContext[orderId] = order.conversationContext;
  }
  return {orderId, order};
}

async function executeOrder(orderId, paymentDetails = {}) {

  const order = await getOrder(orderId);
  Object.assign(order, { orderPayment: {
    paymentName: paymentDetails.creditCardType,
    paymentType: 1,
    paymentSum: order.total,
    creditCard: paymentDetails.creditCardNumber,
    creditCardExp: paymentDetails.creditCardExp,
    creditCardCvv: paymentDetails.creditCardCvv,
    creditCardHolderId: paymentDetails.creditCardHolderId,
  } });
  let transaction;
  try {
    const result = await beecomm.executePushOrder(order);
    transaction = result.transaction;
  } catch (error) {
    throw new OrderError(errors.PROVIDER_ERROR);
  }

  try {
    await notifiyConvService(transaction.id, order);
  } catch (error) {
    // TODO: what to do here
  }

  try {
    await logOrder(order, orderId, transaction);
  } catch (error) {
    // TODO: what to do here
  }

}

async function getOrder(orderId) {
  let order;

  if (!validator.validateOrderId(orderId)) {
    log.error('invalid orderId', { orderId });
    throw new OrderError(errors.INVALID_ORDER_ID);
  }

  try {
    order = await dal.queryWithParams(QUERIES.GET_ORDER_BY_ID, [orderId]);
  } catch (error) {
    throw new OrderError(errors.DB_ERROR);
  }
  if (!order || !order.length) {
    log.error(`getOrder: Order ID ${orderId} not found`);
    throw new OrderError(errors.ORDER_NOT_FOUND);
  }
  return format.orderRecordResultTranslator(order);
}

async function logOrder(orderId, order, transaction = {}) {
  log.info(`saving an 'orderLog' to the db for orderId ${orderId}`);

  order.orderId = orderId;
  order.orderStatus = 1;

  try {
    const orderLog = await dal.prepareOrderLog(order, transaction);
    await dal.commandWithTransaction(orderLog);
    log.info("an 'orderLog' was saved in db");
    return true;
  } catch (error) {
    log.error("an error occurred while creating an 'orderLog' for orderId %s ... error is: %s", orderId, error);
    throw error;
  }
}

async function notifiyConvService(orderId, order, transaction) {
  const body = {
    orderContext: {
      transactionId: transaction.id,
      paymentMethod: {
        currency: order.currency,
        creditCardType: order.orderPayment.paymentName,
        creditCardDigits: validator.getCreditCardLastDigits(order.orderPayment.creditCard)
      }
    },
    conversationContext: orderToConversionContext[orderId],
  };

  try {
    await axios.post(convServiceNotifyEndpoint, {jwt: validator.createJwt(body)});
    log.info(`Successfully notified conversation service on successful order ${orderId}`);
    return true;
  } catch (error) {
    log.error('Error notifying conversation service on successful order', error);
    throw new Error('Failed to notify conversation service: ');
  }
}


module.exports = {
  getCheckOutDetails,
  executeOrder,
};