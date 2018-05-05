
var submitOrderResult = {
    'transactionId':'123456',
    'transactionTimeCreation':new Date().getTime(),
    'status':'OK'
  }
  
  const fs = require('fs');
  //just safe json into disk
  fs.writeFileSync('./submitOrderResult.json', JSON.stringify(submitOrderResult,undefined,2));
  
