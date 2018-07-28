
const fs = require('fs');
const util = require('util');
const https = require('https');
const querystring = require('querystring');
const validator = require('../../util/validator.js');
const mailer = require('../../util/mailer.js');
const beecommOrderSchema = require('./beecommOrder.json');

// beecomm api consts
const client_id = "S1kGCnm9hkKfh0plonkVBmALJvzGcVW1a0qe8BO0PTgWTP0gmiTN300SmWpZtzMx";
const client_secret = "5F6zsjU6HNVP61uq3UDDzl3TOAOihXzGyBEUjmO0dj0siK1LgBwPv0cMk0d2QM9V";
const apiVersion = 2;
const host = "biapp.beecomm.co.il";
const port = "8094";
const tokenResource = util.format("/v%d/oauth/token", apiVersion);
const orderCenterResource = util.format("/api/v%d/services/orderCenter", apiVersion);
const pushOrderResource = orderCenterResource + "/pushOrder";

// beecomm access token
var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Mjc1ODU4OTU2NDUsImNsaWVudCI6eyJfaWQiOiI1YWQ3MjUxYjBkZmJlMGEwOTAyOGU0ZjciLCJjbGllbnRfbmFtZSI6InZlbm9zIiwiaGViTmFtZSI6IteV16DXldehIiwidHlwZSI6ImRlbGl2ZXJ5IiwiaXNBY3RpdmUiOnRydWUsInJlZ2lzdHJhdGlvbkRhdGUiOiIxOC0wNC0yMDE4IDEzOjU5OjM5IiwibGV2ZWwiOjUsInJvbGUiOiJhcHAtY2xpZW50IiwiY2xpZW50X2lkIjoiUzFrR0NubTloa0tmaDBwbG9ua1ZCbUFMSnZ6R2NWVzFhMHFlOEJPMFBUZ1dUUDBnbWlUTjMwMFNtV3BadHpNeCIsImNsaWVudF9zZWNyZXQiOiI1RjZ6c2pVNkhOVlA2MXVxM1VERHpsM1RPQU9paFh6R3lCRVVqbU8wZGowc2lLMUxnQndQdjBjTWswZDJRTTlWIn19.mvTYMNe7GebMAxAIsjw44l5UJx7ZLcLMcmZz06beYVE";

function transfromOrder(source) {
    
    // validate that source odrer json is according to the internal data-model 
    let result = validator.validateInternalOrder(source);
    if (!result) {
        console.log("invalid source order json");
        return null;
    }
    
    let target = {
        branchId: source.brandLocationId,
        orderInfo: {
            orderType: 1,
            dinners: 2,
            discountSum: "",
            outerCompId: 0,
            outerCompOrderId: "",
            arrivalTime: "",
            remarks: source.remarks,
            firstName: source.orderOwner.firstName,
            lastName: source.orderOwner.lastName,
            phone: source.orderOwner.phone,
            email: source.orderOwner.email,
            payments: [],
            deliveryInfo: {
                deliveryCost: 0,
                deliveryRemarks: "",
                city: "",
                street: "",
                homeNum: "",
                apartment: "",
                floor: "",
                companyName: ""
            },
            items: []
        }
    };
    
    source.orderItems.forEach(function (item, index) {
        target.orderInfo.items[index] = {
            netId: parseInt(item.itemId),
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
            unitPrice: item.unitPrice,
            remarks: "",
            belongTo: "",
            billRemarks: "",
            subItems: [],
            toppings: []
        };
    });
    
    // validate that target 'beecomm' odrer json is valid
    result = validator.validateExternalOrder(target, beecommOrderSchema);
    if (!result) {
        console.log("transfomation to 'beecomm' order failed");
        return null;
    }    
    
    return target;
}


function executePushOrder(source, callback) {
    
    let target = transfromOrder(source);
    if (target == null) {
        callback({code: 1, message: "failure in transfromOrder"}, undefined);
        return;
    }
    
    // todo: for now we always say 'OK' and send the confirmation e-mail to '7739985@gmail.com' (seba) 
    
    // let headers = {
    //     'Content-Type': 'application/json',
    //     'access_token': access_token
    // };
    
    // let options = {
    //     host: host,
    //     port: port,
    //     path: pushOrderResource,
    //     method: 'POST',
    //     headers: headers
    // };
    
    // let req = https.request(options, function(res) {
    //     res.setEncoding('utf8');
    //     res.on('data', function (chunk) {
    //         console.log("pushed order to " + pushOrderResource);
    //         console.log('response: ' + chunk);
    //         callback(undefined, {code: res.statusCode, message: chunk});
    //     });
    // });
    
    // req.write(JSON.stringify(target));
    // req.end();
    
    callback(undefined, {code: '200', message: 'OK'});
    mailer.sendOrderConfirmationEmail(target.branchId , target, (error, result) => {
        if (error) {
            console.log(error)
            console.log('an error occurred attempting to send confirmation email for orderId [%s]', source.orderId);    
        } else {
            console.log('a confirmation email for orderId [%s] was sent!', source.orderId);
        }       
    });    
    
}

function retrieveToken(callback) {
    
    let data = querystring.stringify({
        client_id: client_id,
        client_secret: client_secret
    });
    
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    };
    
    let options = {
        host: host,
        port: port,
        path: tokenResource,
        method: 'POST',
        headers: headers
    };
    
    let req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log("got token from " + tokenResource);
            console.log('response: ' + chunk);
            callback(undfined, chunk);
        });
    });
    
    req.write(data);
    req.end();
    
}

exports.executePushOrder = executePushOrder;
exports.retrieveToken = retrieveToken;