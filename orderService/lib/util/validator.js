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
        total: 430,
        currency: "ILS",
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

