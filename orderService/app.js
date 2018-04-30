
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./util/validator.js');
const beecomm = require('./providers/beecomm/beecomm.js');

const app = express();

// Middleware
app.use(bodyParser.json());

app.post('/order', (req, res) => {
    let valid = validator.validateInternalOrder(req.body);
    if (!valid) {
        res.status(400);
        res.send("{\"message\":\"invalid request\"}");
        return;
    }
    
    // create and save 'orderRecord'
    
    let result = beecomm.pushOrder(req.body);
    if (result < 0) {
        res.status(304);
        res.send("{\"orderId\":\"317\",\"message\":\"order not accepted\"}");
        return;
    }

    // if success, create and save 'orderLog'  

    res.status(201);
    res.send("{\"orderId\":\"317\",\"transactionId\":\"tid-Gv47xTT\",\"message\":\"order accepted\"}");
});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));

