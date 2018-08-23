const axios = require('axios');
const qs = require('querystring');

const conf = require('../../../config/conf');
const log = require('../../util/log');
const validator = require('../../util/validator');
const mailer = require('../../util/mailer');
const beecommOrderSchema = require('./beecommOrder.json');

// beecomm api consts
const providerConf = conf.get('providers:beecomm');
const providerBaseUrl = `https://${providerConf.host}:${providerConf.port || 443}`;
const tokenResource = `${providerBaseUrl}/v${providerConf.apiVersion}/oauth/token`;
const orderCenterResource = `/api/v${providerConf.apiVersion}/services/orderCenter`;
const pushOrderResource = orderCenterResource + '/pushOrder';

// beecomm access token
const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Mjc1ODU4OTU2NDUsImNsaWVudCI6eyJfaWQiOiI1YWQ3MjUxYjBkZmJlMGEwOTAyOGU0ZjciLCJjbGllbnRfbmFtZSI6InZlbm9zIiwiaGViTmFtZSI6IteV16DXldehIiwidHlwZSI6ImRlbGl2ZXJ5IiwiaXNBY3RpdmUiOnRydWUsInJlZ2lzdHJhdGlvbkRhdGUiOiIxOC0wNC0yMDE4IDEzOjU5OjM5IiwibGV2ZWwiOjUsInJvbGUiOiJhcHAtY2xpZW50IiwiY2xpZW50X2lkIjoiUzFrR0NubTloa0tmaDBwbG9ua1ZCbUFMSnZ6R2NWVzFhMHFlOEJPMFBUZ1dUUDBnbWlUTjMwMFNtV3BadHpNeCIsImNsaWVudF9zZWNyZXQiOiI1RjZ6c2pVNkhOVlA2MXVxM1VERHpsM1RPQU9paFh6R3lCRVVqbU8wZGowc2lLMUxnQndQdjBjTWswZDJRTTlWIn19.mvTYMNe7GebMAxAIsjw44l5UJx7ZLcLMcmZz06beYVE';

function transformOrder(source) {
  // validate that source odrer json is according to the internal data-model
  let result = validator.validateInternalOrder(source);
  if (!result) {
    log.error('invalid source order json', {source});
    return null;
  }

  const target = {
    branchId: source.brandLocationId,
    orderInfo: {
      orderType: 1,
      dinners: 2,
      discountSum: '',
      outerCompId: 0,
      outerCompOrderId: '',
      arrivalTime: '',
      remarks: source.remarks,
      firstName: source.orderOwner.firstName,
      lastName: source.orderOwner.lastName,
      phone: source.orderOwner.phone,
      email: source.orderOwner.email,
      payments: [],
      deliveryInfo: {
        deliveryCost: 0,
        deliveryRemarks: '',
        city: '',
        street: '',
        homeNum: '',
        apartment: '',
        floor: '',
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


async function executePushOrder(source) {
  const target = transformOrder(source);
  if (target === null) {
    throw new Error({code: 1, message: 'failure in transfromOrder'});
  }

  // todo: for now we always say 'OK' and send the confirmation e-mail to '7739985@gmail.com' (seba)

  // let headers = {
  //     'Content-Type': 'application/json',
  //     'access_token': access_token
  // };

  // let options = {
  //     host: host,
  //     port: port,
  //     path: pushOrderResource,
  //     method: 'POST',
  //     headers: headers
  // };

  // let req = https.request(options, function(res) {
  //     res.setEncoding('utf8');
  //     res.on('data', function (chunk) {
  //         console.log('pushed order to ' + pushOrderResource);
  //         console.log('response: ' + chunk);
  //         callback(undefined, {code: res.statusCode, message: chunk});
  //     });
  // });

  // req.write(JSON.stringify(target));
  // req.end();
  try {
    await mailer.sendOrderConfirmationEmail(target.branchId, target);
    log.info('a confirmation email for orderId [%s] was sent!', source.orderId);
  } catch (error) {
    log.error('an error occurred attempting to send confirmation email for orderId [%s]', {error, orderId: source.orderId});
  }

  return {
    code: '200',
    message: 'OK',
    transaction: {
      id: '333444555',
      creationTime: Date.now(),
      status: 'OK',
    }
  };
}

async function retrieveToken() {
  try {
    const res = await axios.post(tokenResource, qs.stringify({
      client_id: providerConf.client_id,
      client_secret: providerConf.client_secret
    }));
    return res.data;
  } catch (error) {
    log.error('Error retrieving token', error);
  }

}

exports.executePushOrder = executePushOrder;
exports.retrieveToken = retrieveToken;