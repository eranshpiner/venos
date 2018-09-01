const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const log = require('./lib/util/log')('App');

const conf = require('./config/conf');
const customers = require('./lib/customers/customers');
const providers = require('./lib/providers');

const jwtSecret = conf.get('server:jwt:secret');

const app = express();
app
  .set('port', process.env.PORT || conf.get('server:port'))
  .disable('x-powered-by')
  .use(bodyParser.json())
  .use('/static', express.static(path.join(__dirname, 'public')));


Object.keys(providers).forEach(provider => {
  app.use(`/api/conversation/providers/${provider}`, providers[provider].router(customers));
});

//app
//details: order_number, currency, payment_method (card type + last 4 details)
app.post('/api/conversation/notify', (req, res) => {
  const jwtToken = req.body.jwt;
  const orderDetails = jwt.verify(jwtToken, jwtSecret);

  const bot = customers[orderDetails.context && orderDetails.context.botId];
  if (!bot) {
    res.status(404).json({error: { message: `customerId not found` }});
    return;
  }

  bot.provider.externalAction(orderDetails.context.userSessionId, 'checkoutResult', orderDetails);
  res.status(200).json({});
});

app.listen(app.get('port'), () => log.info(`[App] Listening on port ${app.get('port')}`));
