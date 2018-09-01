
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
    if (!result.valid) {
        console.log(result);
    }
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

function getCreditCardLastDigits(creditCard) {
    if (creditCard == null) {
        return null;
    }
    return creditCard.slice(-4);
}

function createTestJwt() {
    let payload = {
        total: 430,
        currency: "nis",
        brandId: "shabtai",
        brandLocationId: "kfar-vitkin",
        conversationContext: {
            userSessionId: "userSession.id",
            conversationProvider: "facebook"
        },
        remarks: "",
        orderOwner: {
            firstName: "vladi",
            lastName: "king",
            phone: "123-456-678",
            email: "johndoe@gmail.com",
            deliveryInfo: {
                city: "paris",
                street: "champs elysees",
                houseNumber: "45a",
                apartment: "23",
                floor: 3
            }
        },
        orderItems: [
            {
                itemId: "156",
                itemName: "pizzapepperoni",
                quantity: 3,
                unitPrice: 70,
                price: 210
            },
            {
                itemId: "435",
                itemName: "pizzatuna",
                quantity: 1,
                unitPrice: 60,
                price: 60
            },
            {
                itemId: "2",
                itemName: "beer",
                quantity: 4,
                unitPrice: 30,
                price: 120
            },
            {
                itemId: "3",
                itemName: "dietcola",
                quantity: 4,
                unitPrice: 10,
                price: 40
            }
        ]
    };

    // let payload = "{\"userSessionId\":\"userSession.id\",\"conversationProvider\":\"facebook\"}";
    // let payload = {transactionId: 'transaction.id', currency: 'NIS', creditCardType: 'VISA', creditCardDigits: '0000', conversationContext: {userSessionId: 'userSession.id', conversationProvider: 'facebook', customerId: 'userSession.customerId'}};
    let jwtToken = jwt.sign(payload, secret);
    console.log(jwtToken);
    console.log(validateAndExtractJwt(jwtToken));
}

function createJwt(payload) {
    let jwtToken = jwt.sign(payload, secret);
    return jwtToken;    
}

// validateJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMDhmODZhZi0zNWRhLTQ4ZjItOGZhYi1jZWYzOTA0NjYwYmQiLCJpYXQiOjE1MjU1MTIwODR9.F1P3Df86YNsmmeAIQU6YEE-lierTnMiU97jkpuzM7pw");
// createTestJwt();

exports.validateInternalOrder = validateInternalOrder;
exports.validateExternalOrder = validateExternalOrder;
exports.validateAndExtractJwt = validateAndExtractJwt;
exports.validateOrderId = validateOrderId;
exports.createJwt = createJwt;
exports.getCreditCardLastDigits = getCreditCardLastDigits;