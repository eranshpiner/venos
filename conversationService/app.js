const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const path = require('path');
const jwt = require('jsonwebtoken');
const secret = 'this_is_the_secret';

const CONST = require('./lib/const');
const Message = require('./lib/models/Message');

const providers = module.exports.providers = require('./lib/providers');
const messageHandler = require('./lib/messageHandler');
console.log("Starting...");

//remove technology exposure
app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
});

//short term to serve static files
app.use('/static',express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

Object.keys(providers).forEach(provider => {
    app.use('/providers', providers[provider].router);
});

//app
//details: order_number, currency, payment_method (card type + last 4 details)
app.post('/notification/order', (req, res) => {

  const jwtToken = req.body.jwt;
  const result = jwt.verify(jwtToken, secret);
  const message = new Message(Date.now());
  message.provider = result.conversationContext.conversationProvider;
  message.customerId = result.conversationContext.customerId;//'378370189311177';//
  message.userDetails = {};
  message.userDetails.id = result.conversationContext.userSessionId;//'1629198287117755'//
  message.orderContext = result.orderContext || {};
  message.action = CONST.ACTIONS.ORDER_RECEIPT;
  messageHandler.handle(message);
  res.json({});
});

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});
