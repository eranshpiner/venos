
const fs = require('fs');
const util = require('util');
const validator = require('../../util/validator.js');
const beecommOrderSchema = require('./beecommOrder.json');

// beecomm api consts
const apiVersion = 2;
const baseUrl = "https://biapp.beecomm.co.il:8094";
const authenticationResource = baseUrl + util.format("/v%d/oauth/token", apiVersion);
const orderCenterResource = baseUrl + util.format("/api/v%d/services/orderCenter", apiVersion);
const pushOrderResource = orderCenterResource + "/pushOrder";


function transfromOrder(source) {
    
    // validate that source odrer json is according to the internal data-model 
    let result = validator.validateInternalOrder(source);
    if (!result) {
        console.log("invalid source order json");
        return null;
    }

    let target = {};
    target.branchId = source.restaurantId;
    
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


function pushOrder(source) {

    let target = transfromOrder(source);
    if (target == null) {
        return -1;
    }

    console.log("pushed order to " + pushOrderResource);
    return true;
}

exports.pushOrder = pushOrder;