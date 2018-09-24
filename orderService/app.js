const express = require('express');
const bodyParser = require('body-parser');

const orderApi = require('./lib/order');
const log = require('./lib/util/log')('App');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/api/order', async (req, res) => {
  const jwtToken = req.body.jwt;
  try {
    const order = await orderApi.createOrder(jwtToken);
    res.status(200).json(order);
  } catch (err) {
    res.status(err.status || 500).json(err.message || { message: 'failed to create order' });
  }
});

app.get('/api/order/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await orderApi.getOrder(orderId);
    res.status(200).json(order);
  } catch (err) {
    res.status(err.status || 500).json(err.message || { message: 'failed to get order' });
  }
});

app.post('/api/order/:id/pay', async (req, res) => {
  const { paymentDetails, deliveryDetails } = req.body || {};
  const orderId = req.params.id;

  try {
    const transaction = await orderApi.executeOrder(orderId, paymentDetails, deliveryDetails);
    res.status(200).json({transaction});
  } catch (error) {
    log.error(error);
    res.status(error.status || 500).json(error.message || { message: 'failed to execute order' });
  }
});

app.listen(3000, () => {
  log.info('Restaurant Integration Service - listening on port 3000...');
});


