
//this an example of input we save into DB. This is generated from the bot input. 
//all not necessary and secure data is removed before saving it to db 


const uuidv1=require('uuid/v1');

var orderRecord = {
    'orderId':uuidv1(), //UUID
    'total':430.00,
    'currency': 'ILS',
    'brandId':'shabtai',
    'brandLocationId':'kfar-vitkin',
    'orderTimeCreation':121232131321, //UTC time
    'remarks':'',
     orderOwner: {
         'firstName':'joe',
         'lastName':'doe',
         'phone':'123-456-678',
         'email':'joedoe1232@gmail.com',
         'deliveryInfo': {
             'city':'new-york',
             'street':'pizza',
             'home':'45a',
             'apartment':23,
             'floor':3
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
            ]
    }
};

const fs = require('fs');
//just safe json into disk
fs.writeFileSync('./orderRecord.json', JSON.stringify(orderRecord,undefined,2));

