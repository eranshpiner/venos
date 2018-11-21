const axios = require('axios');
const schedule = require('node-schedule');
const qs = require('querystring');

const conf = require('../../../config/conf');
const log = require('../../util/log')('BeecommProvider');
const validator = require('../../util/validator');
const beecommOrderSchema = require('./beecommOrder.json');

// beecomm api consts
const providerConf = conf.get('providers:beecomm');
const providerBaseUrl = `https://${providerConf.host}:${providerConf.port || 443}`;
const tokenResource = `${providerBaseUrl}/v${providerConf.apiVersion}/oauth/token`;
const orderCenterResource = `${providerBaseUrl}/api/v${providerConf.apiVersion}/services/orderCenter`;
const pushOrderResource = orderCenterResource + '/pushOrder';

// beecomm access token
var access_token = 'NA';

// schedule the renewal of the token from beecomm every day
schedule.scheduleJob('0 0 */1 * *', function() {
  axios.post(tokenResource, qs.stringify({
    client_id: providerConf.client_id,
    client_secret: providerConf.client_secret
  })).then(function (res) {
    if (res.status == 200) {
      access_token = res.data.access_token;
      log.info('A new token was retrieved successfully from beecomm');
    } else {
      log.error('Recieved an error from beecomm while retrieving a new token', error);
    }
  }).catch(function (error) {
    log.error('Error while trying to retrieve a new token from beecomm', error);
  });
}).invoke();

function transformOrder(source, paymentDetails, pos) {
  // validate that source odrer json is according to the internal data-model
  let result = validator.validateInternalOrder(source);
  if (!result) {
    log.error('invalid source order json', {source});
    return null;
  }

  const target = {
    branchId: pos.posId,
    orderInfo: {
      orderType: 2,
      dinners: 2,
      discountSum: 0.0,
      outerCompId: 63,
      outerCompOrderId: source.orderId,
      arrivalTime: '',
      remarks: source.remarks,
      firstName: source.orderOwner.firstName,
      lastName: source.orderOwner.lastName,
      phone: source.orderOwner.phone,
      email: source.orderOwner.email,
      payments: [{
        paymentType: 2,
        paymentSum: source.subTotal, 
      }],
      deliveryInfo: {
        deliveryCost: source.deliveryFee,
        deliveryRemarks: '',
        city: source.orderOwner.deliveryInfo.city,
        street: source.orderOwner.deliveryInfo.street,
        homeNum: source.orderOwner.deliveryInfo.houseNumber,
        apartment: source.orderOwner.deliveryInfo.apartment,
        floor: '${source.orderOwner.deliveryInfo.floor}',
        companyName: ''
      },
      items: [],
    }
  };

  source.orderItems.forEach((item, index) => {
    target.orderInfo.items[index] = {
      netId: parseInt(item.itemId),
      itemName: item.itemName,
      quantity: item.quantity,
      price: item.price,
      unitPrice: item.unitPrice,
      remarks: '',
      belongTo: '',
      billRemarks: '',
      subItems: [],
      toppings: [],
    };
  });

  // validate that target 'beecomm' odrer json is valid
  result = validator.validateExternalOrder(target, beecommOrderSchema);
  if (!result) {
    log.error('transfomation to beecomm order failed');
    return null;
  }

  return target;
}


async function executePushOrder(order, paymentDetails, pos) {
  const target = transformOrder(order, paymentDetails, pos);
  if (target === null) {
    throw new Error({code: 1, message: 'failure in transfromOrder'});
  }

  let headers = {
      'Content-Type': 'application/json',
      'access_token': access_token
  };

  const ocRes = await axios.post(pushOrderResource, target, {headers: headers});
  
  if (ocRes.status == 200) {
    return {
      code: '200',
      message: 'OK',
      transaction: {
        id: ocRes.data.orderCenterId,
        time: Date.now(),
        status: ocRes.data.message,
      }
    }
  }

  throw new Error({code: 3, message: 'failed to push order to "orderCenter"'});
  
}

module.exports = {
  executePushOrder
};