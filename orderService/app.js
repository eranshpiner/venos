
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./util/validator.js');
const beecomm = require('./providers/beecomm/beecomm.js');
const dal = require ('./dal/dbfacade.js');


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


    // if success, create and save 'orderLog'  

});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));


