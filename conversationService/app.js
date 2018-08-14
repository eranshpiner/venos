const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const log = require('./lib/util/log')('App');

const conf = require('./config/conf');
const customers = require('./lib/customers/customers');
const providers = require('./lib/providers');

const app = express();
app
  .set('port', process.env.PORT || conf.get('server:port'))
  .disable('x-powered-by')
  .use(bodyParser.json())
  .use('/static', express.static(path.join(__dirname, 'public')));


Object.keys(providers).forEach(provider => {
  app.use(`/providers/${provider}`, providers[provider].router(customers));
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

app.listen(app.get('port'), () => log.info(`[App] Listening on port ${app.get('port')}`));
