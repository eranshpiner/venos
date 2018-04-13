
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./util/validator.js');
const beecomm = require('./providers/beecomm/beecomm.js');

const app = express();

// Middleware
app.use(bodyParser.json());

app.post('/pushOrder', (req, res) => {
    let valid = validator.validateInternalOrder(req.body);    
    if (valid) {
        beecomm.transfromOrder(req.body);
        res.status(201);
        res.send("Order Accepted");
    } else {
        res.status(400);
        res.send("Order Not Accepted");
    }
    
});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));