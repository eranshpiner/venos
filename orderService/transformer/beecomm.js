
const validator = require('../util/validator.js');

function transfromOrder(source) {
    
    // validate that the odrer json is according to the internal data-model 
    let result = validator.validateOrder(source);
    if (!result) {
        console.log("invalid source order json");
        return;
    }

    let target = {};
    target.branchId = source.restaurantId;
    target.orderInfo = {};
    target.orderInfo.orderType = source.orderInfo.orderType;
    target.orderInfo.firstName = source.orderInfo.firstName;
    target.orderInfo.lastName = source.orderInfo.lastName;

    console.log(target);

}

exports.transfromOrder = transfromOrder;