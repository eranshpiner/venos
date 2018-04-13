
const fs = require('fs');
const Validator = require('jsonschema').Validator;

var orderJsonSchema = {};
fs.readFile(__dirname + '/../schema/venos/order.json', 'utf8', function (err, data) {
    if (err) {
      console.log(err)
      return;
    }
    orderJsonSchema = JSON.parse(data); 
});

function validateOrder(source) {
    let validator = new Validator();
    let result = validator.validate(source, orderJsonSchema);
    return result.valid;
}

exports.validateOrder = validateOrder;