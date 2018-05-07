
const fs = require('fs');
const util = require('util');
const https = require('https');
const querystring = require('querystring');
const validator = require('../../util/validator.js');
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
var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MjUzNjU3OTE2NjQsImNsaWVudCI6eyJfaWQiOiI1YWQ3MjUxYjBkZmJlMGEwOTAyOGU0ZjciLCJjbGllbnRfbmFtZSI6InZlbm9zIiwiaGViTmFtZSI6IteV16DXldehIiwidHlwZSI6ImRlbGl2ZXJ5IiwiaXNBY3RpdmUiOnRydWUsInJlZ2lzdHJhdGlvbkRhdGUiOiIxOC0wNC0yMDE4IDEzOjU5OjM5IiwibGV2ZWwiOjUsInJvbGUiOiJhcHAtY2xpZW50IiwiY2xpZW50X2lkIjoiUzFrR0NubTloa0tmaDBwbG9ua1ZCbUFMSnZ6R2NWVzFhMHFlOEJPMFBUZ1dUUDBnbWlUTjMwMFNtV3BadHpNeCIsImNsaWVudF9zZWNyZXQiOiI1RjZ6c2pVNkhOVlA2MXVxM1VERHpsM1RPQU9paFh6R3lCRVVqbU8wZGowc2lLMUxnQndQdjBjTWswZDJRTTlWIn19.wb4B4d-jo4jzKg2FOpQ7Xu43CFF2_eCXwDfwdcUMEAw";

function transfromOrder(source) {
    
    // validate that source odrer json is according to the internal data-model 
    let result = validator.validateInternalOrder(source);
    if (!result) {
        console.log("invalid source order json");
        return null;
    }
    
    let target = {};
    target.branchId = source.brandLocationId;
    
    target.orderInfo = {};
    
    // attributes which we do not supply yet
    target.orderInfo.orderType = 1;
    target.orderInfo.dinners = 2; 
    target.orderInfo.discountSum = "";
    target.orderInfo.outerCompId = 0;
    target.orderInfo.outerCompOrderId = "";
    target.orderInfo.arrivalTime = "";
    
    target.orderInfo.remarks = source.remarks;
    target.orderInfo.firstName = source.orderOwner.firstName;
    target.orderInfo.lastName = source.orderOwner.lastName;
    target.orderInfo.phone = source.orderOwner.phone;
    target.orderInfo.email = source.orderOwner.email;
    
    target.orderInfo.items = [];
    source.orderItems.forEach(function (item, index){
        target.orderInfo.items[index] = {};
        target.orderInfo.items[index].netId = parseInt(item.itemId); 
        target.orderInfo.items[index].itemName = item.itemName; 
        target.orderInfo.items[index].quantity = item.quantity;
        target.orderInfo.items[index].price = 1.0; 
        target.orderInfo.items[index].unitPrice = 1.0; 
        target.orderInfo.items[index].remarks = ""; 
        target.orderInfo.items[index].belongTo = ""; 
        target.orderInfo.items[index].billRemarks = ""; 
        target.orderInfo.items[index].subItems = []; 
        target.orderInfo.items[index].toppings = []; 
    });
    
    target.orderInfo.payments = [];
    target.orderInfo.deliveryInfo = {};
    target.orderInfo.deliveryInfo.deliveryCost = 0;
    target.orderInfo.deliveryInfo.deliveryRemarks = "";
    target.orderInfo.deliveryInfo.city = "";
    target.orderInfo.deliveryInfo.street = "";
    target.orderInfo.deliveryInfo.homeNum = "";
    target.orderInfo.deliveryInfo.apartment = "";
    target.orderInfo.deliveryInfo.floor = "";
    target.orderInfo.deliveryInfo.companyName = "";
    
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
        callback({code: -1, message: "failure in transfromOrder"}, undefined);
        return;
    }

    let headers = {
        'Content-Type': 'application/json',
        'access_token': access_token
    };
    
    let options = {
        host: host,
        port: port,
        path: pushOrderResource,
        method: 'POST',
        headers: headers
    };
    
    let req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log("pushed order to " + pushOrderResource);
            console.log('response: ' + chunk);
            callback(undefined, chunk);
        });
    });
    
    req.write(JSON.stringify(target));
    req.end();

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