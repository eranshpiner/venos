
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('./util/validator.js');
const beecomm = require('./providers/beecomm/beecomm.js');
const dal = require ('./dal/dbfacade.js');


const app = express();

// Middleware
app.use(bodyParser.json());

app.use(express.static('public'));

//init db
dal.init();

// this is the GET 'payment' resource which is meant be called from the consumer client side, 
// after being redirected from the conversation flow upon selecting to pay for an order that 
// was completed. the provided jwt is meant to contain the actual 'order'. the response of 
// this resource is a 'payment' form, which includes the 'orderId' as a hidden field. 
app.get('/payment', (req, res) => {
    const order = validator.validateAndExtractJwt(req.query.jwt);

    if (order == null) {
        console.log("invalid jwt");
        res.status(400);
        res.send({message: "invalid jwt"});
        return;
    }

    if (!validator.validateInternalOrder(order)) {
        console.log("invalid order");
        res.status(400);
        res.send({message: "invalid order"});
        return;
    };

    try {

        // create and save 'orderRecord' to get an 'orderId'
        dal.commandWithTransaction(dal.prepareOrderRecord(order), (error,result) => {
            
            if (error) {
                throw error;
            }

            // todo: extract the 'orderId' from the result
            const orderId = "317";

            console.log("an 'orderRecord' for order %d was saved to db... result is: %s", orderId, result);

            // todo: repond with a payment form - including the 'orderId' as a hidden field 
            res.status(200);
            res.send({message: "got it - here is a nice payment form...", orderId: orderId});
            return;

        });  
    } 
    catch (error) {
        
        console.log("an error occurred while creating an 'orderRecord'... error is: %s", error);
        console.log("failed to create an 'orderRecord' in db for order %s...", order);
        
        // todo: what should we return here... ?
        res.status(500);
        res.send({message: "error processing order"});
    }

});

// this is the POST 'order' resource which is meant be called from the consumer client side, 
// submitting the form which contains the payment details for an order (together with the 
// 'orderId' hiddin field). 
app.post('/order', (req, res) => {

    // extract the fields of the form
    const orderId = req.body.orderId;

    if (!validator.validateOrderId(orderId)) {
        console.log("invalid orderId");
        res.status(400);
        res.send({message: "invalid orderId"});
        return;
    }

    try {

        const sqlQueryString_getOrderByOrderId = "select * from order where orderId=?";

        // use the 'orderId' to retrieve the 'orderRecord' from the db
        dal.queryWithParams(sqlQueryString_getOrderByOrderId, [orderId], (error,result) => {
            
            if (error) {
                throw error;
            }

            // todo: extract the 'orderId' from the result
            const orderId = "317";

            console.log("an 'orderRecord' for order %d was saved to db... result is: %s", orderId, result);

            // todo: repond with a payment form - including the 'orderId' as a hidden field 
            res.status(200);
            res.send({message: "got it - here is a nice payment form...", orderId: orderId});
            return;

        });  
    } 
    catch (error) {
        
        console.log("an error occurred while retrieving an 'orderRecord'... error is: %s", error);
        console.log("failed to retrieve an 'orderRecord' from db for orderId %s...", orderId);
        
        // todo: what should we return here... ?
        res.status(500);
        res.send({message: "error processing order"});
    }

    const creditCardType = req.body.creditCardType;
    const creditCardNumber = req.body.creditCardNumber;
    const creditCardHolderId = req.body.creditCardHolderId;
    const creditCardCvv = req.body.creditCardCvv;

    try {

        // retrieve the order from the db using the 'orderId'
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


