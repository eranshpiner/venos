const uuid = require('uuid/v1');

/**
 * Receives an 'orderRecord' result (from the db) and translates it to the 'order' json
 */
function fromOrderRecord(orderRecord) {
  return {
    orderId: orderRecord.orderId,
    total: orderRecord.total,
    subTotal: orderRecord.subTotal,
    currency: orderRecord.currency,
    brandId: orderRecord.brandId,
    brandLocationId: orderRecord.brandLocationId,
    tipPercentage: orderRecord.tipPercentage,
    tipAmount: orderRecord.tipAmount,
    deliveryFee: orderRecord.deliveryFee,
    remarks: orderRecord.remarks,
    orderItems: orderRecord.orderItems.map(fromOrderItemRecord),
    orderOwner: {
      firstName: orderRecord.firstName,
      lastName: orderRecord.lastName,
      phone: orderRecord.phone,
      email: orderRecord.email,
      deliveryInfo: {
        city: orderRecord.city,
        street: orderRecord.street,
        houseNumber: orderRecord.houseNumber,
        apartment: orderRecord.apartment,
        floor: orderRecord.floor,
        postalCode: orderRecord.postalCode,
      },
    },
  };
}

function toOrderRecord(order) {
  const orderRecord = {
    orderId: order.orderId || uuid(),
    total: order.total,
    subTotal: order.subTotal,
    currency: order.currency,
    brandId: order.brandId,
    brandLocationId: order.brandLocationId,
    tipPercentage: order.tipPercentage,
    tipAmount: order.tipAmount,
    deliveryFee: order.deliveryFee,
    orderCreationTime: Date.now(),
    firstName: order.orderOwner.firstName,
    lastName: order.orderOwner.lastName,
    phone: order.orderOwner.phone,
    email: order.orderOwner.email,
    city: order.orderOwner.deliveryInfo.city,
    street: order.orderOwner.deliveryInfo.street,
    houseNumber: order.orderOwner.deliveryInfo.houseNumber,
    apartment: order.orderOwner.deliveryInfo.apartment,
    floor: order.orderOwner.deliveryInfo.floor,
    postalCode:order.orderOwner.deliveryInfo.postalCode,
    company: order.orderOwner.deliveryInfo.company,
    remarks: order.remarks,
  };

  orderRecord.orderItems = order.orderItems.map((orderItem) => toOrderItemRecord(orderItem, orderRecord));
  return orderRecord;
}

function fromOrderItemRecord(orderItemRecord) {
  return {
    itemId: orderItemRecord.itemId,
    itemName: orderItemRecord.itemName,
    categoryId: orderItemRecord.categoryId,
    quantity: orderItemRecord.quantity,
    price: orderItemRecord.price,
    unitPrice: orderItemRecord.unitPrice,
    remarks: orderItemRecord.remarks,
  };
}

function toOrderItemRecord(orderItem, order) {
  return {
    itemId: orderItem.itemId,
    itemName: orderItem.itemName,
    categoryId: orderItem.categoryId,
    quantity: orderItem.quantity,
    price: orderItem.price,
    unitPrice: orderItem.unitPrice,
    remarks: orderItem.remarks,
    orderId: order.orderId,
  };
}

function fromOrderLogRecord(orderLogRecord) {
  return orderLogRecord; // TODO
}

function toOrderLogRecord(order, transaction, pos) {
  return {
    orderId: order.orderId,
    transactionId: transaction.id,
    transactionCreationTime: transaction.creationTime,
    brandId: order.brandId,
    brandLocationId: order.brandLocationId,
    posVendorId: pos.posVendorId,
    posId: pos.posId,
    posResponseStatus: transaction.status,
    //  posResponseCode : ??,
    orderStatus: order.orderStatus,
  };
}

function toLogRecord(order, orderLog, result, error) {

  const log = {
    orderId: order.orderId,
    transactionId: orderLog.transactionId,
    erroCode: '',
    errorText: '',
    componentName: '',
    status: '',
  };
  if (error) {
    log.errorCode = error.errorCode;
    log.errorText = error.errorText;
    log.status = 'failure';
    log.componentName = error.componentName;
  } else {
    log.status = 'success';
    log.componentName = result.componentName;
  }

  if (orderLog) {
    log.transactionId = orderLog.transactionId;
  }

  return log;
}

module.exports = {
  fromOrderRecord,
  toOrderRecord,

  fromOrderItemRecord,
  toOrderItemRecord,

  toOrderLogRecord,
  fromOrderLogRecord,

  toLogRecord,
};