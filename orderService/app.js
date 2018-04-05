const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Validator = require('jsonschema').Validator;

const app = express();

var orderJsonSchema = {};
fs.readFile(__dirname + '/schema/order.json', 'utf8', function (err, data) {
    if (err) {
      console.log(err)
      return;
    }
    orderJsonSchema = JSON.parse(data); 
});

// Middleware
app.use(bodyParser.json());

app.post('/pushOrder', (req, res) => {
    let v = new Validator();
    let result = v.validate(req.body, orderJsonSchema);
    console.log(req.body); 
    console.log(result.valid);
    if (result.valid) {
        res.status(201);
        res.send("Order Accepted");
    } else {
        res.status(400);
        res.send("Order Not Accepted");
    }
    
});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));