const jwt = require('jsonwebtoken');

const log = require('./log')('CartUtil');
const menuUtils = require('./menu');
const conf = require('./../../config/conf');

const secret = conf.get('server:jwt:secret');
const PAYMENT_URL = (jwt) => `http${conf.get('dev') ? '' : 's'}://${conf.get('server:orderServiceDomain')}/payment/?jwt=${jwt}`;
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

function getReceipt({customer, order, payment, transaction}) {
  const receipt = {
    recipient_name: `${order.orderOwner.firstName} ${order.orderOwner.lastName}`,
    order_number: order.orderId,
    currency: order.currency,
    payment_method: payment.method,
    address: {
      street_1: order.orderOwner.deliveryInfo.street,
      street_2: order.orderOwner.deliveryInfo.houseNumber,
      city: order.orderOwner.deliveryInfo.city,
      state: 'ישראל',
      country: 'ישראל',
      postal_code: order.orderOwner.deliveryInfo.postalCode || 0,
    },
    summary: {
      subtotal: order.subTotal,
      shipping_cost: order.deliveryFee,
      total_tax: 0, // TODO
      total_cost: order.total,
    },
    adjustments: [],
    elements: order.orderItems.map((item) => {
      const menuItem = menuUtils.getItem(customer, item.categoryId, item.itemId);
      return {
        title: item.itemName,
        subtitle: item.remarks,
        quantity: item.quantity,
        price: item.price,
        currency: order.currency,
        image_url: (menuItem && (menuItem.imageThumbnail || menuItem.image)).substring(2) || menuUtils.NO_IMAGE,
      };
    }),
  };
  if (order.tipAmount > 0) {
    receipt.adjustments.push({name: 'טיפ', amount: order.tipAmount});
  }
  return receipt;
}

function getCartSubTotal({cart = [], customer}) {
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

function getPaymentURL({botId, customer, provider, context: {cart = [], deliveryInfo = {}, userDetails = {}}}) {
  const subTotal = getCartSubTotal({cart, customer});
  const orderItems = cart.map(item => {
    const {categoryId, itemId} = item;
    let price = item.price;
    let remarks = [item.notes];
    if (item.customizations) {
      Object.entries(item.customizations).forEach(([custCatId, items]) => {
        items.forEach(item => {
          const custItem = menuUtils.getCustomizationsItem(customer, categoryId, itemId, custCatId, item);
          if (custItem.price > 0) {
            price += custItem.price;
          }
          remarks.push(custItem.name);
        });
      });
    }
    return {
      itemId: item.itemId.toString(),
      itemName: item.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      unitPrice: item.price,
      price: price * item.quantity,
      remarks: remarks.join(', '),
    }
  });

  const payload = {
    subTotal,
    currency: 'ILS',
    brandId: customer.id + "", // TODO: shpiner why is this not a number?
    brandLocationId: customer.branches[0].branchName, // TODO: ?
    remarks: '',
    orderOwner: {
      firstName: userDetails.first_name,
      lastName: userDetails.last_name,
      phone: userDetails.phone || '052-TOD0000', // TODO: should be collected on checkout page
      email: userDetails.email || 'noemail@mail.com', // TODO: should be collected on checkout page
      deliveryInfo: {
        city: deliveryInfo.city,
        street: deliveryInfo.street,
        houseNumber: deliveryInfo.houseNumber || 'N/A',
        apartment: deliveryInfo.apartment || 'N/A',
        floor: deliveryInfo.floor || 0,
      },
    },
    deliveryFee: customer.deliveryFee, // TODO[seba] dynamic per location
    orderItems: orderItems,
    orderPayment: {
      paymentType: 1,
      paymentSum: subTotal,
      paymentName: '',
      creditCard: '',
      creditCardExp: '',
      creditCardCvv: '',
      creditCardHolderId: '',
    },
    conversationContext: {
      userSessionId: userDetails.id,
      conversationProvider: provider.name,
      botId,
    },
  };

  const jwtToken = jwt.sign(JSON.stringify(payload), secret);
  return PAYMENT_URL(jwtToken);
}

module.exports = {
  addToCart,

  getCartItems,
  getCartSubTotal,
  getPaymentURL,
  getReceipt,
};
