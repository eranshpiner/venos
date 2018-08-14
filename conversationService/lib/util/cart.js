const jwt = require('jsonwebtoken');

const menuUtils = require('./menu');

const CONST = require('./../const');

const secret = 'this_is_the_secret';
const PAYMENT_URL = (jwt) => `https://venos-stg.natiziv.com/payment?jwt=${jwt}`;
const NO_IMAGE = 'https://afs.googleusercontent.com/gumtree-com/noimage_thumbnail_120x92_v2.png';

function addToCart({cart, customer, item, customizations, notes, categoryId, itemId}) {
  cart.push({
    id: Date.now(),
    name: item.name,
    itemId,
    categoryId,
    customizations,
    notes,
    price: item.price,
    quantity: 1,
  });
}

function getCartItems({customer, provider, context: { cart }}) {
  return cart.map((cartItem) => {
    const {itemId, categoryId, customizations} = cartItem;
    const menuItem = menuUtils.getItem(customer, categoryId, itemId);

    const description = [];
    description.push(`${cartItem.quantity}x ₪${cartItem.price}`);
    let totalCustomizationsPrice = 0;
    if (customizations) {
      Object.entries(customizations).forEach(([custCatId, items]) => {
        items.forEach(item => {
          const custItem = menuUtils.getCustomizationsItem(customer, categoryId, itemId, custCatId, item);
          if (custItem.price > 0) {
            description.push(`${custItem.name} - בתוספת ₪${cartItem.price} `);
            totalCustomizationsPrice += custItem.price;
          } else {
            description.push(custItem.name);
          }
        });
      });
    }
    if (cartItem.notes) {
      description.push(`הערות: ${cartItem.notes}`);
    }
    if (!description.length) {
      description.push(menuItem.desc);
    }
    return provider.createListElement({
      title: menuItem.name,
      subtitle: description.join('\n'),
      image_url: menuItem.image !== '' ? menuItem.image.substring(2) : NO_IMAGE,
      buttons: [provider.createButton('ערוך', `action?editItem?${cartItem.id}`)],
    });
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

function getCartTotal({cart = [], customer}) {
  return cart.reduce((total, item) => {
    let sum = total + (item.price * item.quantity);
    Object.entries(item.customizations).forEach(([custCat, custItems]) => {
      custItems.forEach(custItemId => {
        const customizationItem = menuUtils.getCustomizationsItem(customer, item.categoryId, item.itemId, custCat, custItemId);
        if (customizationItem && customizationItem.price > 0) {
          sum += customizationItem.price;
        }
      });
    });
    return sum;
  }, 0);
}

function getPaymentURL({customer, provider, context: {cart = [], deliveryInfo = {}, userDetails = {}}}) {
  const total = getCartTotal({cart, customer});
  const orderItems = cart.map(item => {
    const {categoryId, itemId} = item;
    let price = item.price;
    if (item.customizations) {
      Object.entries(item.customizations).forEach(([custCatId, items]) => {
        items.forEach(item => {
          const custItem = menuUtils.getCustomizationsItem(customer, categoryId, itemId, custCatId, item);
          if (custItem.price > 0) {
            price += custItem.price;
          }
        });
      });
    }
    return {
      itemId: item.itemId.toString(),
      itemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      price: price * item.quantity,
    }
  });

  const payload = {
    total,
    currency: 'nis',
    brandId: 'shabtai',
    brandLocationId: 'kfar-vitkin',
    remarks: '',
    orderOwner: {
      firstName: userDetails.first_name,
      lastName: userDetails.last_name,
      phone: userDetails.phone,
      email: userDetails.email,
      deliveryInfo,
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
      userSessionId: userDetails.id,
      conversationProvider: provider.name,
      customerId: customer.id,
    }
  };

  const jwtToken = jwt.sign(JSON.stringify(payload), secret);
  return PAYMENT_URL(jwtToken);
}

module.exports = {
  addToCart,

  getCartItems,
  getCartTotal,
  getPaymentURL,
  getReceipt,
};
