
var orderLog = {
  'orderId': '2fd3f7a0-491d-11e8-8329-3135e0d5b94e',
  'transactionId':'123456',
  'transactionTimeCreated':2323232323,
  'brandId':'shabtai',
  'brandLocationId':'kfar-vitkin',
  'posVendorId':'000',
  'posId':'0012',
  'posResponseStatus':'OK',
  'posResponseCode':200,
  'orderStatus':200
}

const fs = require('fs');
//just safe json into disk
fs.writeFileSync('./orderLog.json', JSON.stringify(orderLog,undefined,2));
