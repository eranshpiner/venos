
const fs = require('fs');

const orderSchema = require('./../schema/order.json');
const orderItemsSchema = require('./../schema/orderItems.json');
const orderOwnerSchema = require('./../schema/orderOwner.json');
const orderPaymentSchema = require('./../schema/orderPayment.json');

const Validator = require('jsonschema').Validator;
const v = new Validator();

v.addSchema(orderItemsSchema, "/orderItems");
v.addSchema(orderOwnerSchema, "/orderOwner");
v.addSchema(orderPaymentSchema, "/orderPayment");

function validateInternalOrder(order) {
    let result = v.validate(order, orderSchema);
    //console.log('*** result=', result);
    return result.valid;
}

function validateExternalOrder(order, schema) {
    let result = v.validate(order, schema);
    return result.valid;
}

exports.validateInternalOrder = validateInternalOrder;
exports.validateExternalOrder = validateExternalOrder;