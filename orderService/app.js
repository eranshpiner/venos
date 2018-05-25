
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
        var orderReq = dal.prepareOrderRecord(order);
        //console.log("orderReq=", orderReq.orderCommand);
        dal.commandWithTransaction(orderReq.commands, (error, result) => {
            
            if (error) {
                throw error;
            }
            const orderId = orderReq.orderId;
            console.log(`an 'orderRecord' for order ${orderId} was saved to db... result is: ${result}`);

            // todo: repond with a payment form - including the 'orderId' as a hidden field 
            res.status(200);
            res.send({message: "got it - here is a nice payment form...", orderId: orderId, result: result});
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
    const orderId = req.query.orderId;

    if (!validator.validateOrderId(orderId)) {
        console.log("invalid orderId");
        res.status(400);
        res.send({message: "invalid orderId"});
        return;
    }

    try {

        // todo: need a join query to retrieve both the order and the orderItems
        const sqlQueryString_getOrderByOrderId = "select * from venos.order where orderId=?";

        // use the 'orderId' to retrieve the 'orderRecord' from the db
        dal.queryWithParams(sqlQueryString_getOrderByOrderId, [orderId], (error, result) => {
            
            if (error) {
                console.log("an error occurred while retrieving an 'orderRecord'... error is: %s", error);
                console.log("failed to retrieve an 'orderRecord' from db for orderId %s...", orderId);
                
                // todo: what should we return here... ?
                res.status(500);
                res.send({message: "error processing order"});
                return;
            }

            if (!Array.isArray(result) || result.length != 1) {
                console.log("got an invalid result from db retrieving an 'orderRecord' for orderId %s", orderId);

                // todo: what should we return here... ?
                res.status(500);
                res.send({message: "error processing order"});
                return;
            }

            const order = result[0];
            // const creditCardType = req.body.creditCardType;
            // const creditCardNumber = req.body.creditCardNumber;
            // const creditCardHolderId = req.body.creditCardHolderId;
            // const creditCardCvv = req.body.creditCardCvv;

            // call pos provider
            beecomm.executePushOrder(order, (error, result) => {

                if (error) {
                    console.log("encountered an error %d while executing 'pushOrder' to beecomm pos provider. error message: %s", error.code, error.message);

                    // todo: what should we return here... ?
                    res.status(500);
                    res.send({message: "error processing order"});
                    return;

                } else {

                    // todo: extract the 'transactionId' from the beecomm response
                    const transactionId = "tid-Gv47xTT";     
                    const transactionCreationTime = new Date().getTime();

                    res.status(201);
                    res.send({orderId: orderId, transactionId: transactionId, message: "order accepted", response: result});
                    
                    // todo: if success, create and save 'orderLog'     
                    console.log("saving an 'orderLog' to the db for orderId %s", orderId);

                    const submitOrderResult = {
                        transactionId: transactionId,
                        transactionCreationTime: transactionCreationTime,
                        status: "OK"
                    };

                    dal.commandWithTransaction(dal.prepareOrderLog(order, submitOrderResult), (error,result) => {
                        
                        if (error) {
                            console.log("an error occurred while creating an 'orderLog' for orderId $s ... error is: %s", orderId, error);
                            throw error;
                        }

                        console.log("an 'orderLog' was saved in db");
                    });
                }

            });

        });  

    } 
    catch (error) {
        
        console.log("an error occurred while retrieving an 'orderRecord'... error is: %s", error);
        console.log("failed to retrieve an 'orderRecord' from db for orderId %s...", orderId);
        
        // todo: what should we return here... ?
        res.status(500);
        res.send({message: "error processing order"});
    } 

});

app.listen(3000, () => console.log('Restaurant Integration Service - listening on port 3000...'));


