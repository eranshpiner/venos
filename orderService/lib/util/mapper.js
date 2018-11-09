const conf = require('../../config/conf');
const customersConf = conf.get('customers');

const idMap = {};

for (brandId in customersConf) {
    const info = customersConf[brandId].info;
    if (info.menu != null && info.menu.items != null) {
        idMap[brandId] = buildMap(info.menu.items);
    } else {
        idMap[brandId] = {};
    }
}

function buildMap(categories) {    
    const result = {};
    for (cIndex in categories) {
        let category = categories[cIndex];
        if (category.id != 38753) {
            for (ciIndex in category.items) {
                let item = category.items[ciIndex];
                let sourceId;
                let targetId;
                for (key in item) {
                    if (key.toLowerCase() == 'id') {
                        sourceId = item[key];
                    }
                    if (key.toLowerCase() == 'poscode') {
                        targetId = item[key];
                    }
                    if (targetId != null && sourceId != null) {
                        break;
                    }
                }
                if (targetId != null && targetId != "" && sourceId != null && sourceId != "") {
                    result[sourceId] = targetId;
                }
            }
        }
    }
    return result;
}

async function applyPosCodes(order) {
    if (order == null) {
        return;
    }
    order.orderItems.forEach((item) => {
        item.itemId = idMap[order.brandId][item.itemId];
    });
}

module.exports = {
    applyPosCodes,
};