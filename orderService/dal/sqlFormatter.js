const mysql = require('mysql');
const uuid  = require ('uuid/v1');



var formatSql = (command, parameters) => {
    return mysql.format(command,parameters);
}

/**
 * Receives order (the initial input) and transforms it to the order record
 * @param {*} order 
 */
var orderRecordBuilder = (order) => {
    var orderRecord = {
        orderId      : uuid(),
        total        : order.total,
        currency     : order.currency, 
        brandId      : order.brandId,
        brandLocationId   : order.brandLocationId ,
        orderTimeCreation : new Date().getTime(), 
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
    return orderRecord;
}


var orderItemsBuilder = (orderId, order) => {

    var dbItems = [];
    var items = order.orderItems;
    //console.log('order=', JSON.stringify(order.orderItems,undefined,2));
    console.log('length =', order.orderItems.lenght);

    //TODO - lenght returns here undefined value!!
    //fix it!!!
    for (i=0; i < 3; i++){
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


module.exports = {
    formatSql,
    orderRecordBuilder,
    orderItemsBuilder
}