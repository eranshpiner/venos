
const fs = require('fs');

const orderSchema = require('./../schema/order.json');
const orderInfoSchema = require('./../schema/orderInfo.json');
const orderOwnerSchema = require('./../schema/orderOwner.json');
const orderPaymentSchema = require('./../schema/orderPayment.json');

const Validator = require('jsonschema').Validator;
const v = new Validator();

v.addSchema(orderInfoSchema, "/orderInfo");
v.addSchema(orderOwnerSchema, "/orderOwner");
v.addSchema(orderPaymentSchema, "/orderPayment");

function validateInternalOrder(order) {
    let result = v.validate(order, orderSchema);
    return result.valid;
}

exports.validateInternalOrder = validateInternalOrder;

// function validateExternalOrder(order, schema) {
//     let validator = new Validator();
//     let result = validator.validate(order, schema);
//     return result.valid;
// }


// exports.validateExternalOrder = validateExternalOrder;