const jwt = require('jsonwebtoken');

const CONST = require('./../const');

const secret = 'this_is_the_secret';
const PAYMENT_URL = (jwt) => `https://venos-stg.natiziv.com/payment?jwt=${jwt}`;

function getCartItems(cartItems, menuItems, lang = 'he_IL') {
  return cartItems.map((cartItem) => {
    const menuItem = menuItems[cartItem.categoryId].items.find((element) => element.id === cartItem.id);
    const description = [];
    if (cartItem.customizations) {
      Object.entries(cartItem.customizations).forEach(([catId, items]) => {
        const catAdds = menuItem.CategoriesAdd.find(catAdds => catAdds.id.toString() === catId.toString());
        items.forEach(item => {
          const custItem = catAdds.itemsAdd.find(itemAdd => itemAdd.id === item);
          description.push(custItem.name);
        });
      });
    }
    if (cartItem.notes) {
      description.push(`הערות: ${cartItem.notes}`);
    }
    if (!description.length) {
      description.push(menuItem.desc);
    }
    description.push(`${cartItem.quantity}x ₪${cartItem.price}`);
    return {
      title: menuItem.name,
      description: description.join('\n'),
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

function getReceipt(cart = []) {
  const items = [...cart.items];
  return {
    recipientName: 'TODO',
    orderNumber: '12345',
    currency: 'ILS',
    timestamp: '1530298536336',
    address: {
      city: 'TODO-city',
      address: 'address',
      postalCode: '12345',
      state: '',
      country: 'Israel',
    },
    adjustments: [],
    summary: {
      subTotal: 100,
      shipping: 10,
      tax: 0,
      total: 110,
    },
    items,
  };
}

function getPaymentURL(userSession) {
  const cart = userSession.cart || [];

  let total = 0;
  const orderItems = cart.map(item => {
    const price = item.price * item.quantity;
    total += price;
    return {
      itemId: item.id.toString(),
      itemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      price,
    }
  });

  const payload = {
    total,
    currency: 'nis',
    brandId: 'shabtai',
    brandLocationId: 'kfar-vitkin',
    remarks: '',
    orderOwner: {
      firstName: 'joe',
      lastName: 'doe',
      phone: '123-456-678',
      email: 'tzuvys@gmail.com',
      deliveryInfo: {
        city: 'new-york',
        street: 'pizza',
        houseNumber: '45a',
        apartment: '23',
        floor: 3
      },
    },
    orderItems: orderItems,
    orderPayment: {
      paymentType: 1,
      paymentSum: total,
      paymentName: 'wtf?',
      creditCard: '3434-3434-4334-3434',
      creditCardExp: '09/20',
      creditCardCvv: '000',
      creditCardHolderId: '343545645454',
    },
    conversationContext: {
      userSessionId: userSession.id,
      conversationProvider: 'facebook',
      customerId: userSession.customerId
    }
  };

  const jwtToken = jwt.sign(JSON.stringify(payload), secret);
  return PAYMENT_URL(jwtToken);
}

module.exports = {
  getCartItems,
  getPaymentURL,
  getReceipt,
};
