const uuidv4 = require('uuid/v4');
 
const order = require('./order'); 
const orders = {};

function getOrder(orderId) {
    return orders[orderId];
}

function removeOrder(orderId) {
    return delete orders[orderId]; //returns a boolean
}

function createOrder(orderId) {
    const curOrderId = orderId || uuidv4();

}

function getNextItems(orderId, ItemId) {
    
}

exports.getOrder = getOrder;
exports.removeOrder = removeOrder;
exports.createOrder = createOrder;
