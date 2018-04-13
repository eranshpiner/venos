
const fs = require('fs');
const Validator = require('jsonschema').Validator;

var orderJsonSchema = {};
fs.readFile(__dirname + '/../schema/order.json', 'utf8', function (err, data) {
    if (err) {
      console.log(err)
      return;
    }
    orderJsonSchema = JSON.parse(data); 
});

function validateInternalOrder(order) {
    let validator = new Validator();
    let result = validator.validate(order, orderJsonSchema);
    return result.valid;
}

function validateExternalOrder(order, schema) {
    let validator = new Validator();
    let result = validator.validate(order, schema);
    return result.valid;
}

exports.validateInternalOrder = validateInternalOrder;
exports.validateExternalOrder = validateExternalOrder;