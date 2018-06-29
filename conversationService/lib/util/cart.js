const jwt = require('jsonwebtoken');

const CONST = require('./../const');

const secret = 'this_is_the_secret';
const PAYMENT_URL = (jwt) => `https://venos-stg.natiziv.com/payment?jwt=${jwt}`;

function getCartItems(cartItems, menuItems, lang = 'he_IL') {
  return cartItems.map((cartItem) => {
    const menuItem = menuItems[cartItem.categoryId].items.find((element) => element.id === cartItem.id);
    const descAdd = [];
    if (cartItem.customizations) {
      Object.entries(cartItem.customizations).forEach(([catId, items]) => {
        const catAdds = menuItem.CategoriesAdd.find(catAdds => catAdds.id.toString() === catId.toString());
        items.forEach(item => {
          const custItem = catAdds.itemsAdd.find(itemAdd => itemAdd.id === item);
          descAdd.push(custItem.name);
        });
      });
    }
    return {
      title: menuItem.name,
      description: descAdd.length ? descAdd.join('\n') : menuItem.desc,
      imageUrl: menuItem.image.substring(2, menuItem.image.length),
      actions: [
        {
          text: 'הסר',
          clickData: {
            action: CONST.ACTIONS.REMOVE_FROM_CART,
            data: {
              id: cartItem.id,
              name: menuItem.name
            },
          },
        },
      ],
    }
  });
}

function getPaymentURL(userSession) {

  const payload = {
    "total": 430,
    "currency": "nis",
    "brandId": "shabtai",
    "brandLocationId": "kfar-vitkin",
    "remarks": "",
    "orderOwner": {
      "firstName": "joe",
      "lastName": "doe",
      "phone": "123-456-678",
      "email": "tzuvys@gmail.com",
      "deliveryInfo": {
        "city": "new-york",
        "street": "pizza",
        "houseNumber": "45a",
        "apartment": "23",
        "floor": 3
      }
    },
    "orderItems": [{
      "itemId": "156",
      "itemName": "pizzapepperoni",
      "quantity": 3,
      "unitPrice": 70,
      "price": 210
    }, {
      "itemId": "435",
      "itemName": "pizzatuna",
      "quantity": 1,
      "unitPrice": 60,
      "price": 60
    }, {
      "itemId": "2",
      "itemName": "beer",
      "quantity": 4,
      "unitPrice": 30,
      "price": 120
    }, {
      "itemId": "3",
      "itemName": "dietcola",
      "quantity": 4,
      "unitPrice": 10,
      "price": 40
    }],
    "orderPayment": {
      "paymentType": 1,
      "paymentSum": 55.7,
      "paymentName": "wtf?",
      "creditCard": "3434-3434-4334-3434",
      "creditCardExp": "09/20",
      "creditCardCvv": "000",
      "creditCardHolderId": "343545645454"
    }
  };

  const jwtToken = jwt.sign(JSON.stringify(payload), secret);
  return PAYMENT_URL(jwtToken);
}

module.exports = {
  getCartItems,
  getPaymentURL,
};
