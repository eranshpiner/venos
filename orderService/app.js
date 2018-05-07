
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./util/validator.js');
const beecomm = require('./providers/beecomm/beecomm.js');
const dal = require ('./dal/dbfacade.js');


const app = express();

// Middleware
app.use(bodyParser.json());
//init db
dal.init();

var tempOrder;

app.get('/payment', (req, res) => {
    const order = validator.validateAndExtractJwt(req.query.jwt);

    if (order == null) {
        res.status(400);
        res.send({message: "invalid jwt"});
        return;
    }

    if (!validator.validateInternalOrder(order)) {
        res.status(400);
        res.send({message: "invalid order"});
        return;
    };

    // create and save 'orderRecord' to get an 'orderId'

    res.status(200);
    res.send({message: "got it - here is a nice payment form...", orderId: "the 'orderId'"});
    return;

});

app.post('/order', (req, res) => {
    const orderId = req.query.orderId;

    if (!validator.validateOrderId(orderId)) {
        res.status(400);
        res.send({message: "invalid orderId"});
        return;
    }

    // retrieve the order from the db using the 'orderId'

    try {
        // create and save 'orderRecord' 
        dal.commandWithTransaction(dal.prepareOrderRecord(req.body), (error,result) => {
            if (error) {
                //todo - send intrenal error
                throw error;
            }
            console.log('Order is saved in db... resutl=', result);
           
           //call pos provider
            beecomm.executePushOrder(req.body, (error, result) => {

            if ( error && error.code < 0 ) {

                console.log('error==', error);
                res.status(304);
                res.send("{\"orderId\":\"317\",\"message\":\"order not accepted\"}");

            } else {
                res.status(201);
                res.send("{\"orderId\":\"317\",\"transactionId\":\"tid-Gv47xTT\",\"message\":\"order accepted\",\"response\":\"" + result + "\"}");
                // TODO if success, create and save 'orderLog'     
                console.log('saving order log...');
                //TODO - temporary just for test. Remove it. The result should be taken from the previous call
                let submitOrderResult = {
                    "transactionId": "123456",
                    "transactionTimeCreation": 1525439330522,
                    "status": "OK"
                };
                dal.commandWithTransaction(dal.prepareOrderLog(req.body, submitOrderResult), (error,result) => {
                    if (error) {
                        console.log('error : in saving order log', error);
                        throw error;
                    }
                    console.log('order log is saved in database');
                });
             }//else
        });  
    });    
    }catch (error){
        console.log('failed to execute order.. retry');
        //save error in db error log table
        dal.commandWithTransaction(dal.prepareLog(req.body,undefines,error,undefined));

        //TODO - return error to the bot
        //todo - it can be a situation when order submit is success but saving orderLof failed
        //after some retrieds - we should write failure to the error table
        res.status(304);
        res.send("{\"orderId\":\"317\",\"message\":\"order not accepted\"}");
    }   

});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));


