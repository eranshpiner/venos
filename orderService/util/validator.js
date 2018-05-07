
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = "this_is_the_secret";

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
    const result = v.validate(order, orderSchema);
    return result.valid;
}

function validateExternalOrder(order, schema) {
    const result = v.validate(order, schema);
    return result.valid;
}

function validateAndExtractJwt(jwtToken) {
    const result = jwt.verify(jwtToken, secret);
    return result;
}

function validateOrderId(orderId) {
    // sanitise
    return true;
}

function createJwt() {
    let payload = "{\"total\":430,\"currency\":\"nis\",\"brandId\":\"shabtai\",\"brandLocationId\":\"kfar-vitkin\",\"remarks\":\"\",\"orderOwner\":{\"firstName\":\"joe\",\"lastName\":\"doe\",\"phone\":\"123-456-678\",\"email\":\"joedoe98876@gmail.com\",\"deliveryInfo\":{\"city\":\"new-york\",\"street\":\"pizza\",\"houseNumber\":\"45a\",\"apartment\":\"23\",\"floor\":3}},\"orderItems\":[{\"itemId\":\"156\",\"itemName\":\"pizzapepperoni\",\"quantity\":3,\"unitPrice\":70,\"price\":210},{\"itemId\":\"435\",\"itemName\":\"pizzatuna\",\"quantity\":1,\"unitPrice\":60,\"price\":60},{\"itemId\":\"2\",\"itemName\":\"beer\",\"quantity\":4,\"unitPrice\":30,\"price\":120},{\"itemId\":\"3\",\"itemName\":\"dietcola\",\"quantity\":4,\"unitPrice\":10,\"price\":40}],\"orderPayment\":{\"paymentType\":1,\"paymentSum\":55.7,\"paymentName\":\"wtf?\",\"creditCard\":\"3434-3434-4334-3434\",\"creditCardExp\":\"09/20\",\"creditCardCvv\":\"000\",\"creditCardHolderId\":\"343545645454\"}}";
    let jwtToken = jwt.sign(payload, secret);
    console.log(jwtToken);
    validateAndExtractJwt(jwtToken);
}

// validateJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMDhmODZhZi0zNWRhLTQ4ZjItOGZhYi1jZWYzOTA0NjYwYmQiLCJpYXQiOjE1MjU1MTIwODR9.F1P3Df86YNsmmeAIQU6YEE-lierTnMiU97jkpuzM7pw");
// createJwt();

exports.validateInternalOrder = validateInternalOrder;
exports.validateExternalOrder = validateExternalOrder;
exports.validateAndExtractJwt = validateAndExtractJwt;
exports.validateOrderId = validateOrderId;