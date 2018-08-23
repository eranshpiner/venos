const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const order = require('./lib/order');
const dal = require('./lib/dal/dbfacade');
const log = require('./lib/util/log');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//init db
dal.init();

// this is the GET 'payment' resource which is meant be called from the consumer client side, 
// after being redirected from the conversation flow upon selecting to pay for an order that 
// was completed. the provided jwt is meant to contain the actual 'order'. the response of 
// this resource is a 'payment' form, which includes the 'orderId' as a hidden field. 
app.get('/payment', async (req, res) => {
  try {
    //const checkoutPageDetails = await order.getCheckOutDetails(req.query.jwt);
    //res.status(200).render('checkout', checkoutPageDetails);
    res.status(200).render('checkout');
  } catch (error) {
    res.status(500).send({message: "error processing order"});
  }

});

// this is the POST 'order' resource which is meant be called from the consumer client side, 
// submitting the form which contains the payment details for an order (together with the 
// 'orderId' hiddin field). 
app.post('/order', async (req, res) => {
  const { orderId } = req.body;

  const paymentDetails = {
    paymentName: req.body.creditCardType,
    creditCard: req.body.creditCardNumber,
    creditCardExp: req.body.creditCardExp,
    creditCardCvv: req.body.creditCardCvv,
    creditCardHolderId: req.body.creditCardHolderId,
  };

  try {
    const transaction = await order.executeOrder(orderId, paymentDetails);
    res.status(200).render('success', transaction);
  } catch (error) {
    res.status(error.status || 500).json(error);
  }
});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));


