
//this an example of input sent by the bot to the order service



var order = {
    'total':430.00,
    'currency': 'nis',
    'brandId':'shabtai',
    'brandLocationId':'kfar-vitkin',
    'remarks':'',
     orderOwner: {
         'firstName':'joe',
         'lastName':'doe',
         'phone':'123-456-678',
         'email':'joedoe98876@gmail.com',
         'deliveryInfo': {
             'city':'new-york',
             'street':'pizza',
             'houseNumber':'45a',
             'apartment':'23',
             'floor':3
         },
     },
     orderItems:
             [
                 {
                  'itemId':'156',
                  'itemName':'pizza pepperoni',
                  'quantity':3,
                  'unitPrice':70,
                  'price':210
                },
                {
                  'itemId':'435',
                  'itemName':'pizza tuna',
                  'quantity':1,
                  'unitPrice':60,
                  'price':60
                },
                {
                   'itemId':'2',
                   'itemName':'beer',
                   'quantity':4,
                   'unitPrice':30,
                   'price':120
                },
                {
                   'itemId':'3',
                   'itemName':'diet cola',
                   'quantity':4,
                   'unitPrice':10,
                   'price':40 
                }    
            ],
    orderPayment: {
                'paymentType': 'credit',
                'paymentSum': '430',
                'paymentName':'wtf?',
                'creditCard':'3434-3434-4334-3434',
                'creditCardExp':'09/20',
                'creditCardCvv':'000',
                'creditCardHolderId':'343545645454'
            }
};

const fs = require('fs');
//just safe json into disk
fs.writeFileSync('./order.json', JSON.stringify(order,undefined,2));

const format = require('../../dal/sqlFormatter');
const dal = require ('../../dal/dbfacade');

var orderRecord = format.orderRecordBuilder(order);
//console.log('order is formatted: ' ,orderRecord);

//console.log('sql:', JSON.stringify (orderRecord));
var orderItems = format.orderItemsBuilder(orderRecord.orderId, order);
//console.log('orderItems:', JSON.stringify (orderItems[0]));
//console.log('###orderItems.length=', orderItems.length);

dal.init();

/*
//insert order to db (order table)
dal.command('INSERT INTO venos.ORDER SET ?',orderRecord, (result) => {
    console.log('result=',JSON.stringify(result,undefined,2));
} );

for (i=0; i < orderItems.length; i++){
    dal.command('INSERT INTO venos.orderItems SET ?', orderItems[i], (result) => {
        console.log('result',JSON.stringify(result,undefined,2));
    })
}
*/

//prepare transactions
var commandForTransaction=[];

var orderCommand = {
    query:'INSERT INTO venos.ORDER SET ?',
    parameters:orderRecord
}
commandForTransaction.push(orderCommand);

for (i=0; i < orderItems.length; i++){
    var orderItem = {
        query:'INSERT INTO venos.orderItems SET ?',
        parameters:orderItems[i]
    } 
    commandForTransaction.push(orderItem);
}
dal.commandWithTransaction(commandForTransaction, (result)=> {
    console.log('result=',JSON.stringify(result,undefined,2));
 })

    //dal.command('INSERT INTO venos.orderItems SET ?', orderItems[i], (result) => {
      //  console.log('result',JSON.stringify(result,undefined,2));
    //})
/*
//read all orders 
dal.query('SELECT COUNT(*) FROM venos.ORDER',(result)=> {
    console.log('result=',JSON.stringify(result,undefined,2));
});
//query with parameters
dal.queryWithParams('SELECT * from venos.ORDER WHERE orderId=?', ['b1b5d6d0-4a30-11e8-a242-9138c93c5bd8'], (result)=>{
    console.log('result=', JSON.stringify(result,undefined,2));
})

dal.queryWithParams('SELECT * from venos.ORDERITEMS WHERE orderId=?', ['b1b5d6d0-4a30-11e8-a242-9138c93c5bd8'], (result)=>{
    console.log('result=', JSON.stringify(result,undefined,2));
})
*/


//dal.close();


