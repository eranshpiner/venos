const axios = require('axios');

const beecomm = require('./providers/beecomm/beecomm');
const mailer = require('./util/mailer');
const conf = require('./../config/conf');
const errors = require('./errors/errors');
const OrderError = require('./errors/OrderError');
const db = require('./model');
const validator = require('./util/validator');
const mapper = require('./util/mapper');
const format = require('./util/format');
const log = require('./util/log')('OrderAPI');

const convServiceNotifyEndpoint = `https://${conf.get('server:conversationServiceDomain')}/api/conversation/notify`;

const orderToConversionContext = {};

async function createOrder(jwtToken) {
  const order = validator.validateAndExtractJwt(jwtToken);
  if (order === null) {
    log.error('Invalid JWT', {jwtToken});
    throw new OrderError(errors.INVALID_JWT);
  } else {
    delete order.iat;
  }

  if (!validator.validateInternalOrder(order)) {
    log.error('Invalid order', {order});
    throw new OrderError(errors.INVALID_ORDER);
  }

  if (!order.total) {
    order.total = order.subTotal + order.deliveryFee;
  }

  // create and save 'orderRecord' to get an 'orderId'
  const orderReq = format.toOrderRecord(order);
  const orderId = orderReq.orderId;
  try {
    await db.sequelize.transaction((t) => db.order.create(orderReq, {transaction: t, include: [db.orderItem]}));
    log.info(`Successfully created order ${orderId}`);
  } catch (error) {
    log.error("failed to create an 'orderRecord' in db for order %s...", {error, order});
    throw new OrderError(errors.DB_ERROR);
  }

  if (order.conversationContext !== null) {
    orderToConversionContext[orderId] = order.conversationContext;
  }
  return {orderId, order};
}

async function executeOrder(orderId, paymentDetails, deliveryDetails) {
  if (!validator.validateOrderId(orderId)) {
    log.error('executeOrder: invalid orderId', {orderId});
    throw new OrderError(errors.INVALID_ORDER_ID);
  }

  if (!validator.validateCreditCard(paymentDetails)) {
    log.error('executeOrder: invalid payment details');
    throw new OrderError(errors.INVALID_PAYMENT_DETAILS);
  }

  await updateOrderDetails(orderId, {... deliveryDetails, email: paymentDetails.email});

  const order = await getOrder(orderId);

  let pos;
  try {
    pos = await db.pos.findOne({where: {brandId: order.brandId, brandLocationId: order.brandLocationId}});
  } catch (error) {
    log.error('executeOrder: Failed to get POS from DB', error);
    throw new OrderError(errors.DB_ERROR);
  }

  if (!pos) {
    log.error('executeOrder: No POS found', {brandId: order.brandId, brandLocationId: order.brandLocationId});
    throw new OrderError(errors.INVALID_ORDER);
  }

  let transaction;
  try {
    await mapper.applyPosCodes(order);
    const result = await beecomm.executePushOrder(order, paymentDetails, pos);
    transaction = result.transaction;
  } catch (error) {
    log.error('executeOrder: Failed to execute order with provider', error);
    throw new OrderError(errors.PROVIDER_ERROR);
  }

  try {
    await notifyConversationService(order, paymentDetails, transaction);
  } catch (error) {
    log.error('executeOrder: Failed to notify conversation service', error);
    // TODO: what to do here
  }


  try {
    await mailer.sendBrandNotificationEmail(order, transaction);
    log.info(`executeOrder: a confirmation email for orderId [${orderId}] was sent to brand!`);
  } catch (error) {
    // TODO: what to do here
    log.error('executeOrder: an error occurred attempting to send confirmation email', {error, orderId});
  }

  try {
    await mailer.sendCustomerConfirmationEmail(order, transaction);
    log.info(`executeOrder: a confirmation email for orderId [${orderId}] was sent to vendor!`);
  } catch (error) {
    // TODO: what to do here
    log.error('executeOrder: an error occurred attempting to send confirmation email', {error, orderId});
  }

  try {
    await logOrder(order, transaction, pos);
  } catch (error) {
    log.error('executeOrder: Failed to log order', error);
    // TODO: what to do here
  }

  return transaction;
}

async function getOrder(orderId) {
  let order;

  if (!validator.validateOrderId(orderId)) {
    log.error('getOrder: invalid orderId', {orderId});
    throw new OrderError(errors.INVALID_ORDER_ID);
  }

  try {
    order = await db.order.findOne({
      where: {orderId},
      include: [{model: db.orderItem, required: true}],
    });
  } catch (error) {
    log.error(error);
    throw new OrderError(errors.DB_ERROR);
  }
  if (!order) {
    log.error(`getOrder: Order ID ${orderId} not found`);
    throw new OrderError(errors.ORDER_NOT_FOUND);
  }
  return format.fromOrderRecord(order);
}

async function logOrder(order, transaction, pos) {
  log.info(`logOrder: saving orderLog for orderId ${order.orderId}`);

  order.orderStatus = 1;
  const orderLogRecord = format.toOrderLogRecord(order, transaction, pos);

  try {
    await db.orderLog.create(orderLogRecord);
    return true;
  } catch (error) {
    throw error;
  }
}

async function notifyConversationService(order, paymentDetails, transaction) {
  const body = {
    order,
    transaction,
    payment: {
      method: validator.getCreditCardLastDigits(paymentDetails.creditCardNumber),
    },
    context: orderToConversionContext[order.orderId],
  };

  try {
    const response = await axios.post(convServiceNotifyEndpoint, {jwt: validator.createJwt(body)});
    log.info(`Successfully notified conversation service on successful order ${order.orderId}`);
    return true;
  } catch (error) {
    log.error(`Error notifying conversation service on successful order: ${error.response && error.response.status}`, error.response.data);
    throw new Error(`Failed to notify conversation service: ${error.response && error.response.status}`);
  }
}

async function updateOrderDetails(orderId, details) {
  const order = await getOrder(orderId);
  const values = {};

  if (details.email) {
    values.email = details.email;
  }
  if (details.city) {
    values.city = details.city;
  }
  if (details.street) {
    values.street = details.street;
  }
  if (details.houseNumber) {
    values.houseNumber = details.houseNumber;
  }
  if (details.postalCode) {
    values.postalCode = details.postalCode;
  }
  if ('tipPercentage' in details) {
    values.tipPercentage = details.tipPercentage;
  }

  if ('tipAmount' in details) {
    values.tipAmount = details.tipAmount;
  }

  values.total = order.subTotal + order.deliveryFee + (details.tipAmount || 0);

  try {
    await db.order.update(values, { where: { orderId } });
  } catch (error) {
    log.error(`updateOrderDeliveryDetails: Failed to update order details for ${orderId}`, error);
    throw new OrderError(errors.DB_ERROR);
  }
  return true;
}

module.exports = {
  createOrder,
  getOrder,
  executeOrder,
};