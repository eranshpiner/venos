const ccValidator = require('card-validator');

const jwt = require('jsonwebtoken');
const secret = "this_is_the_secret";

const orderSchema = require('../../schema/order.json');
const orderItemsSchema = require('../../schema/orderItems.json');
const orderOwnerSchema = require('../../schema/orderOwner.json');
const orderPaymentSchema = require('../../schema/orderPayment.json');

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

function validateCreditCard({creditCardNumber, creditCardExp, creditCardCvv}) {
    const ccValidation = ccValidator.number(creditCardNumber);
    const expirationDateValidation = ccValidator.expirationDate(creditCardExp);
    const cvvValidation = ccValidator.cvv(creditCardCvv, ccValidation && ccValidation.card && ccValidation.card.code && ccValidation.card.code.size);
    console.info(ccValidation, expirationDateValidation, cvvValidation);
    return ccValidation.isValid && expirationDateValidation.isValid  && cvvValidation.isValid;
}

function getCreditCardLastDigits(creditCardNumber) {
    const ccValidation = ccValidator.number(creditCardNumber);
    return `${ccValidation.card.niceType} ${creditCardNumber.substr(-4)}`;
}

function createTestJwt() {
    let payload = {
        subTotal: 78,
        currency: "ILS",
        brandId: "6366",
        brandLocationId: "tel-aviv",
        conversationContext: {
            userSessionId: "userSession.id",
            conversationProvider: "facebook"
        },
        remarks: "",
        deliveryFee: 0,
        orderOwner: {
            firstName: "sebastian",
            lastName: "bogacz",
            phone: "0547739985",
            email: "7739985@gmail.com",
            deliveryInfo: {
                city: "tel-aviv",
                street: "liberman",
                houseNumber: "7",
                apartment: "5",
                floor: 2
            }
        },
        orderItems: [
            {
                itemId: "288506",
                itemName: "ניני סשימי",
                categoryId: "yy",
                quantity: 1,
                unitPrice: 66,
                price: 66
            },
            {
                itemId: "288653",
                itemName: "קולה זירו אישי",
                categoryId: "xx",
                quantity: 1,
                unitPrice: 12,
                price: 12
            }
        ]
    };
    
    // let payload = "{\"userSessionId\":\"userSession.id\",\"conversationProvider\":\"facebook\"}";
    // let payload = {transactionId: 'transaction.id', currency: 'ILS', creditCardType: 'VISA', creditCardDigits: '0000', conversationContext: {userSessionId: 'userSession.id', conversationProvider: 'facebook', customerId: 'userSession.customerId'}};
    let jwtToken = jwt.sign(payload, secret);
    console.log(jwtToken);
    console.log(validateAndExtractJwt(jwtToken));
}

function createJwt(payload) {
    let jwtToken = jwt.sign(payload, secret);
    return jwtToken;
}

module.exports = {
    validateInternalOrder,
    validateExternalOrder,
    validateAndExtractJwt,
    validateOrderId,
    createJwt,
    getCreditCardLastDigits,
    validateCreditCard,
};

