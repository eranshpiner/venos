
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
    }
};

const fs = require('fs');
//just safe json into disk
fs.writeFileSync('./order.json', JSON.stringify(order,undefined,2));

