const mysql = require('mysql');
const uuid  = require ('uuid/v1');
const dal = require ('./dbfacade.js');

//init db
//dal.init();

var formatSql = (command, parameters) => {
    return mysql.format(command,parameters);
}

/**
 * Receives an 'orderRecord' result (from the db) and translates it to the 'order' json 
 * @param {*} result 
 */
var orderRecordResultTranslator = (result) => {
    if ((result == null) || result.length < 1) {
        return null;
    }

    // set the base order details
    const dbOrder = result[0];
    const order = {
        total: dbOrder.total,
        currency: dbOrder.currency, 
        brandId: dbOrder.brandId,
        brandLocationId: dbOrder.brandLocationId,
        remarks: "dbOrder.remarks",
        orderItems: [],
        orderOwner: {
            firstName: dbOrder.firstName,
            lastName: dbOrder.lastName,
            phone: dbOrder.phone,
            email: dbOrder.email,
            deliveryInfo: {
                city: dbOrder.city,
                street: dbOrder.street,
                houseNumber: dbOrder.houseNumber,
                apartment: dbOrder.apartment,
                floor: dbOrder.floor
            }
        }
    };

    // set the menu items
    for (i=0; i < result.length; i++) {
        dbItem = result[i];
        order.orderItems[i] = {
            itemId: dbItem.itemId,
            itemName: dbItem.itemName,
            quantity: dbItem.quantity,
            price: dbItem.price,
            unitPrice: dbItem.unitPrice
        };
    }

    return order;
}

/**
 * Receives order (the initial input) and transforms it to the order record
 * @param {*} order 
 */
var orderRecordBuilder = (order) => {
    console.log('house number=%s',order.orderOwner.deliveryInfo.houseNumber)
    console.log('start orderRecordBuilder...');
    var orderRecord = {
        orderId      : uuid(),
        total        : order.total,
        currency     : order.currency, 
        brandId      : order.brandId,
        brandLocationId   : order.brandLocationId ,
        orderCreationTime : new Date().getTime(), 
        firstName    : order.orderOwner.firstName,
        lastName     : order.orderOwner.lastName,
        phone        : order.orderOwner.phone ,
        email        : order.orderOwner.email,
        city         : order.orderOwner.deliveryInfo.city,
        street       : order.orderOwner.deliveryInfo.street, 
        houseNumber  : order.orderOwner.deliveryInfo.houseNumber,
        apartment    : order.orderOwner.deliveryInfo.apartment,
        floor        : order.orderOwner.deliveryInfo.floor,
        company      : order.orderOwner.deliveryInfo.company,
        remarks      : order.remarks
    };
    console.log('end orderRecordBuilder...');
    return orderRecord;
}

var orderItemsBuilder = (orderId, order) => {

    var dbItems = [];
    var items = order.orderItems;
    //console.log('order=', JSON.stringify(order.orderItems,undefined,2));

    for (i=0; i < order.orderItems.length; i++){
        var dbItem = {
            itemId    : items[i].itemId,
            itemName  : items[i].itemName,
            quantity  : items[i].quantity,
            price     : items[i].price,
            unitPrice : items[i].unitPrice, 
            orderId   : orderId, //not sure it's correct way doing that
            remarks   : items[i].remarks
        }
       // console.log('dbItem=',dbItem);
        dbItems.push(dbItem); 
    }
    return dbItems;
}

var orderLogBuilder = (order, submitOrderOutput, pos) => {

    console.log('start orderLogBuilder');

    var orderLog = {
        orderId         : order.orderId,
        transactionId   : submitOrderOutput.transactionId,
        transactionCreationTime : submitOrderOutput.transactionCreationTime,
        brandId         : order.brandId,
        brandLocationId : order.brandLocationId,
        posVendorId     : pos.posVendorId,
        posId           : pos.posId,
        posResponseStatus: submitOrderOutput.transactionStatus,
        //  posResponseCode : ??,
        orderStatus: order.orderStatus 
    }
    console.log('orderLog====>', orderLog);

    return orderLog;
}

var logBuilder = (order,orderLog,result,error) => {

    var log = {
        orderId         : order.orderId,
        transactionId   : orderLog.transactionId,
        erroCode        : '',
        errorText       : '',
        componentName   : '',
        status          : '',
    }
    if (error){
        log.errorCode = error.errorCode;
        log.errorText = error.errorText;
        log.status    = 'failure';
        log.componentName = error.componentName;
    }else {
        log.status='success';
        log.componentName = result.componentName;
    }

    if (orderLog) {
        log.transactionId = orderLog.transactionId;
    }

    return log;
}


var selectOrderDetails = (orderId) => {
    
}


module.exports = {
    formatSql,
    orderRecordBuilder,
    orderItemsBuilder,
    orderLogBuilder,
    logBuilder,
    selectOrderDetails,
    orderRecordResultTranslator
}