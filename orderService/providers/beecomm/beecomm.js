
const fs = require('fs');
const util = require('util');
const validator = require('../../util/validator.js');

// beecomm api consts
const apiVersion = 2;
const baseUrl = "https://biapp.beecomm.co.il:8094";
const authenticationResource = baseUrl + util.format("/v%d/oauth/token", apiVersion);
const orderCenterResource = baseUrl + util.format("/api/v%d/services/orderCenter", apiVersion);
const pushOrderResource = orderCenterResource + "/pushOrder";


var beecommOrderJsonSchema = {};
fs.readFile(__dirname + '/order.json', 'utf8', function (err, data) {
    if (err) {
      console.log(err)
      return;
    }
    beecommOrderJsonSchema = JSON.parse(data); 
});

function transfromOrder(source) {
    
    // validate that source odrer json is according to the internal data-model 
    let result = validator.validateInternalOrder(source);
    if (!result) {
        console.log("invalid source order json");
        return;
    }

    let target = {};
    target.branchId = source.restaurantId;
    
    target.orderInfo = {};
    target.orderInfo.orderType = source.orderInfo.orderType;
    target.orderInfo.firstName = source.orderInfo.firstName;
    target.orderInfo.lastName = source.orderInfo.lastName;
    target.orderInfo.phone = source.orderInfo.phone;
    target.orderInfo.remarks = source.orderInfo.remarks;
    target.orderInfo.dinners = source.orderInfo.dinners;
    target.orderInfo.email = source.orderInfo.email;
    target.orderInfo.discountSum = "";
    target.orderInfo.outerCompId = 0;
    target.orderInfo.outerCompOrderId = "";
    target.orderInfo.dinners = 0;
    target.orderInfo.arrivalTime = "";

    target.orderInfo.items = [];
    source.orderInfo.menuItems.forEach(function (item, index){
        target.orderInfo.items[index] = {};
        target.orderInfo.items[index].netId = item.itemId; 
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

    console.log("succeeded");
    return target;

}

function pushOrder(order) {

    // validate that target odrer json is valid
    result = validator.validateExternalOrder(order, beecommOrderJsonSchema);
    if (!result) {
        console.log("invalid target order json");
        return false;
    }    

    console.log(pushOrderResource);

    return true;
}

function pushOrder(order) {

    // validate that target odrer json is valid
    result = validator.validateExternalOrder(order, beecommOrderJsonSchema);
    if (!result) {
        console.log("invalid target order json");
        return false;
    }    

    console.log(pushOrderResource);

    return true;
}

exports.transfromOrder = transfromOrder;
exports.pushOrder = pushOrder;