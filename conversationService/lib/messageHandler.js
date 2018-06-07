'use strict';

const providers = require('./providers');
const sessionManager = require('./sessionManager');
const CONST = require('./const');
const cordsToAddress = require('./util/locations').cordsToAddress;
const strToAddress = require('./util/locations').strToAddress;

const cartUtils = require('./util/cart');

const menu = require('./../customers/niniHachiMenu.json').rest.menu;

const addressFlow = {
  "step1": "הכנס עיר",
  "step2": "הכנס רחוב",
  "step3": "הכנס מספר בית",
  "step4": "הכנס מספר דירה",
  "step5": "הכנסה קומה",
};

const handlers = {};

handlers[CONST.ACTIONS.APPROVE_DELIVERY_ADDRESS] = (message, userSession) => {
  let response = {};

  const address = message.actionData.address;

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: `מיקום 🔥! אנחנו שולחים ל${address}!`
  });

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'בחר קטגוריה',
    replies: getCategories(menu.items, true),
  });

}

handlers[CONST.ACTIONS.CHOOSE_DELIVERY_ADDRESS] = (message, userSession) => {
  let response = {};

  const address = message.actionData.address;

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: `מיקום 🔥! אנחנו שולחים ל${address}!`
  });

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'בחר קטגוריה',
    replies: getCategories(menu.items, true),
  });

}

handlers[CONST.ACTIONS.CHOOSE_CATEGORY] = (message, userSession) => {
  let response = {};

  const category = menu.items[message.actionData.id];
  if (category && category.items) {
    response.type = CONST.RESPONSE_TYPE.ITEMS;
    response.items = getItems(menu.items, message.actionData.id);
    response.replies = getCategories(menu.items, true);
  } else {
    response.type = CONST.RESPONSE_TYPE.TEXT;
    response.text = `oh nooooo, category ${message.actionData.id} has no items.`;
    response.replies = getCategories(menu.items, true);
  }
  message.responses.push(response);
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'למעלה תוכל למצוא את המנות שבקטגוריה שבחרת או פשוט תבחר קטגוריה אחרת',
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.MORE] = (message, userSession) => {
  let response = {};

  const sliceStart = message.actionData.sliceStart;
  const sliceEnd = message.actionData.sliceEnd;

  // message.responses.push(response);
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'קבל עוד אופציות',
    replies: getCategories(menu.items, true, sliceStart, sliceEnd),
  });

};

handlers[CONST.ACTIONS.ADD_TO_CART] = (message, userSession) => {
  let response = {};
  response.type = CONST.RESPONSE_TYPE.TEXT;

  const itemId = message.actionData.id;
  const categoryId = message.actionData.categoryId;
  const menuItem = menu.items[categoryId].items.find((e) => e.id === itemId);
  userSession.cart = userSession.cart || [];

  if (!menuItem) {
    response.text = `Sorry, I couldn't find it on the menu, please try again.`;
  }
  const cartItem = {id: menuItem.id, quantity: 1, categoryId: categoryId, customizations: []};
  userSession.cart.push(cartItem);

  if (menuItem.CategoriesAdd && menuItem.CategoriesAdd.length) {
    cartItem.hasCustomization = true;
    userSession.currentItem = {
      item: cartItem,
      menuItem,
      customizationItem: 0,
      customizationItemsTotal: menuItem.CategoriesAdd.length,
    };
    Object.assign(response, getItemCustomization(userSession.currentItem));
  } else {
    response.text = `hurray, item ${menuItem.name} has been added to cart.`;
    response.replies = getCategories(menu.items, true);
  }
  message.responses.push(response);
};

function getItemCustomization(item) {
  const customizationItem  = item.menuItem.CategoriesAdd[item.customizationItem];
  // TODO: handle scenario where all customizations were already selected
  if (customizationItem.single) {
    const items = [];
    customizationItem.itemsAdd.forEach((addItem) => {
      if (!item.item.customizations.includes(addItem.id)) {
        items.push(itemToElement(addItem, null, null, [{
          text: 'הוסף',
          clickData: {
            action: CONST.ACTIONS.CHOOSE_CUSTOMIZATION,
            data: {
              id: addItem.id,
              categoryId: item.customizationItem,
              isSingle: true,
            },
          }
        }]));
      }
    });
    item.customizationItem += 1;

    return {
      type: CONST.RESPONSE_TYPE.ITEMS,
      text: customizationItem.name,
      items,
    }
  } else {
    const replies = [{
      text: 'הכל טוב כפרה',
      clickData: {
        action: CONST.ACTIONS.CHOOSE_CUSTOMIZATION,
        data: {
          id: -1,
        },
      },
    }];
    customizationItem.itemsAdd.forEach((addItem) => {
      if (!item.item.customizations.includes(addItem.id)) {
        replies.push({
          text: addItem.name,
          clickData: {
            action: CONST.ACTIONS.CHOOSE_CUSTOMIZATION,
            data: {
              id: addItem.id,
            },
          },
        });
      }
    });
    return {
      type: CONST.RESPONSE_TYPE.TEXT,
      text: customizationItem.name,
      replies,
    }
  }
};

handlers[CONST.ACTIONS.CHOOSE_CUSTOMIZATION] = (message, userSession) => {
  let response = {};
  const customizationId = message.actionData.id;
  if (customizationId === -1) {
    userSession.currentItem.customizationItem += 1;
  }

  if (userSession.currentItem.customizationItem >= userSession.currentItem.customizationItemsTotal) {
    response.type = CONST.RESPONSE_TYPE.TEXT;
    response.text = 'מגניב! בוא נמשיך';
    response.replies = getCategories(menu.items, true);
  } else {
    userSession.currentItem.item.customizations.push(customizationId);
    Object.assign(response, getItemCustomization(userSession.currentItem));
  }
  message.responses.push(response);
};

handlers[CONST.ACTIONS.REMOVE_FROM_CART] = (message, userSession) => {
  let response = {};
  const itemId = message.actionData.id;
  const itemName = message.actionData.name;
  const isReduceQuantity = message.actionData.reduceQuantity;
  const menuItem = menu.items[itemId];
  userSession.cart = userSession.cart || [];

  const cartItemIndex = userSession.cart.findIndex((item) => item.id === itemId);
  const cartItem = userSession.cart[cartItemIndex];
  if (cartItemIndex === -1) {
    response.text = `Sorry, we couldn't find ${itemName} in your cart cart.`;
  } else {
    if (isReduceQuantity && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      response.text = `hurray, item ${itemName} has been reduced to ${cartItem.quantity}.`;
    } else {
      userSession.cart.splice(cartItemIndex, 1); // TODO normal remove
      response.text = `hurray, item ${itemName} has been removed from cart.`;
      response.replies = getCategories(menu.items, true);
    }
  }

  response.replies = getCategories(menu.items, true);

  message.responses.push(response);
};

handlers[CONST.ACTIONS.GET_CART] = (message, userSession) => {
  const cart = userSession.cart || [];

  if (!cart.length) {
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: 'עוד לא בחרת כלום. בוא נתחיל! בחר קטגוריה',
      replies: getCategories(menu.items, true),
    });
  } else {
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: ` יש לך${cart.length}פריטים בעגלה `,
    });
    message.responses.push({
      type: CONST.RESPONSE_TYPE.CART_SUMMARY,
      cartItems: getCartItems(cart, menu.items),
      cartActions: [
        {
          text: 'הזמן עכשיו',
          clickLink: cartUtils.getPaymentURL(userSession),
        },
      ],
    });
  }
};

handlers[CONST.ACTIONS.EMPTY_CART] = (message, userSession) => {
  userSession.cart = [];
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'Your card has been emptied',
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.CHOOSE_DELIVERY_METHOD] = (message, userSession) => {
  if (message.actionData && message.actionData.method) {
    userSession.deliveryMethod = message.actionData.method;
  }

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: `אנא הזן את הכתובת למשלוח`,
    replies: [{
      type: CONST.REPLY_TYPE.LOCATION,
    }],
  });
};

handlers[CONST.ACTIONS.RESET_SESSION] = async (message, userSession) => {
  await sessionManager.resetSession(userSession);
  message.responses.push({
    type: CONST.REPLY_TYPE.TEXT,
    text: 'אפסנו לך הכל. תרשום משהו כדי להתחיל'
  });
};

async function handle(message) {
  const provider = providers[message.provider];
  const userSession = await sessionManager.getUserSession(message.userDetails);

  userSession.locale = userSession.locale || 'he_IL';
  message.responses = message.responses || [];
  if (message.action) {
    if (handlers[message.action]) {
      await handlers[message.action](message, userSession);
    } else {
      message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: `I don't know this one, ${message.action}`
      });
    }
  } else {
    if (!userSession.deliveryMethod) {
      message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: 'ברוכים הבאים! לפני שנתחיל, בחר את שיטת המשלוח',
        replies: [{
          type: CONST.REPLY_TYPE.TEXT,
          text: 'משלוח',
          clickData: {
            action: CONST.ACTIONS.CHOOSE_DELIVERY_METHOD,
            data: {
              method: CONST.DELIVERY_METHOD.DELIVERY,
            },
          },
        }, {
          type: CONST.REPLY_TYPE.TEXT,
          text: 'איסוף עצמי',
          clickData: {
            action: CONST.ACTIONS.CHOOSE_DELIVERY_METHOD,
            data: {
              method: CONST.DELIVERY_METHOD.PICKUP,
            },
          },
        }],
      });
    } else if (userSession.deliveryMethod === CONST.DELIVERY_METHOD.DELIVERY && !userSession.deliveryAddress) {
      if (message.attachments) {
        const coords = message.attachments[0] && message.attachments[0].payload && message.attachments[0].payload.coordinates;
        const addresses = await cordsToAddress(coords);
        const address = (addresses && addresses.length > 0) ? addresses[0] : undefined;
        userSession.deliveryAddress = address.address;
        message.responses.push({
          type: CONST.RESPONSE_TYPE.TEXT,
          text: `הכתובת שלך לחץ מטה לאשר או לתקן את הכתובת, : ${userSession.deliveryAddress}!`,
          replies: [
            {
              type: CONST.REPLY_TYPE.TEXT,
              text: 'אשר כתובת',
              clickData: {
                action: CONST.ACTIONS.APPROVE_DELIVERY_ADDRESS,
                data: {
                  action: CONST.ACTIONS.APPROVE_DELIVERY_ADDRESS,
                  address: userSession.deliveryAddress
                },
              },
            },
            {
              type: CONST.REPLY_TYPE.TEXT,
              text: 'תקן כתובת',
              clickData: {
                action: CONST.ACTIONS.FIX_DELIVERY_ADDRESS,
                data: {
                  action: CONST.ACTIONS.FIX_DELIVERY_ADDRESS
                },
              },
            }
          ]
        });
      } else {
        const addresses = await strToAddress(message.messageContent);
        message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: `אנא בחר את האפשרות הכי מתאימה`
        });

        message.responses.push({
          type: CONST.RESPONSE_TYPE.ADDRESS_LIST,
          items: getPossibleAddresses(addresses)
        });
      }
    } else {
      message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: menu.welcome[userSession.locale],
        replies: getCategories(menu.items, true),
      });

    }
  }

  if (message.action && message.action !== CONST.ACTIONS.RESET_SESSION) {
    await sessionManager.saveUserSession(userSession);
  }

  provider.sendMessage(message);
}


function getItems(items, categoryId, lang = 'he_IL') {
  const category = items[categoryId];
  const res = [];
  if (category && category.items) {
    category.items.forEach(item => {
      // if (items[itemId]) {
        res.push(itemToElement(item, item.id, lang, [{
          text: 'הוסף', // TODO
          clickData: {
            action: CONST.ACTIONS.ADD_TO_CART,
            data: {
              id: item.id,
              categoryId: categoryId
            },
          }
        }]));

    });
  }
  return res;
}

function getPossibleAddresses(addresses, lang = 'he_IL') {
  const res = addresses.map((address) => ({
    type: CONST.REPLY_TYPE.TEXT,
    title:address.address,
    actions: [
      {
        text: address.address,
        clickData: {
          action: CONST.ACTIONS.CHOOSE_DELIVERY_ADDRESS,
          data: {
            address: address.address,
            placeId: address.placeId
          },
        }
      }
    ]
  }));
  return res.splice(0, 4); // todo limit 10
}

function getCartItems(cartItems, menuItems, lang = 'he_IL') {

  const res = cartItems.map((cartItem) => {
    var menuItem2 = menuItems[cartItem.categoryId].items.find(function(element) {   return element.id === cartItem.id; });
    return {
      title: menuItem2.name,
        description: menuItem2.desc,
      imageUrl: menuItem2.image.substring(2, menuItem2.image.length),
      actions: [
      {
        text: 'הסר',
        clickData: {
          action: CONST.ACTIONS.REMOVE_FROM_CART,
          data: {
            id: cartItem.id,
            name:menuItem2.name

          },
        },
      },
    ],
    }
  });
  return res;
}

function getCategories(items, onlyTopLevel = false, lang = 'he_IL', sliceStart, sliceEnd ) {
  const elements = [];

  if(!sliceStart & !sliceEnd) {
    for (var i = 0, len = 7; i <= len; i++) {

      elements.push(categoryToElement(items[i], i, lang));

    }
    sliceStart = 8;
    sliceEnd = 15;
  } else if (sliceEnd <= items.length){

    for (var i = sliceStart, len = sliceEnd; i <= len; i++) {

      elements.push(categoryToElement(items[i], i, lang, sliceStart, sliceEnd));

    }
    sliceStart += 8;
    sliceEnd +=8;


  }else{
    for (var i = sliceStart, len = items.length; i < len; i++) {

      elements.push(categoryToElement(items[i], i, lang, sliceStart, items.length));

    }

  }


  // Object.entries(items).forEach(([itemId, item]) => {
  //
  //   elements.push(categoryToElement(item, itemId, lang))
  //
  //   }
  // );

  // if(!sliceStart & !sliceEnd){
  //   elements.push(elements.slice(0, 7));
  //   sliceStart = 8;
  //   sliceEnd = 15;
  // }else{
  //   elements.push(elements.slice(sliceStart, sliceEnd));
  //
  // }

  elements.push (cartButtonToElement());
  elements.push (moreButtonToElement(sliceStart, sliceEnd));
  return elements;
}

function categoryToElement(item, itemId, lang) {
  const element = {
    text: item.name,
    clickData: {
      action: CONST.ACTIONS.CHOOSE_CATEGORY,
      data: {
        id: itemId,
      },
    },
  };
  if (item.image) {
    var image = item.image.substring(2, item.image.length);
    element.imageUrl = image;
  }
  return element;
}

function cartButtonToElement() {
  const element = {
    text: 'הזמנה',
    image_url:"https://visualpharm.com/assets/482/Shopping%20Cart-595b40b65ba036ed117d241c.svg",
    clickData: {
      action: CONST.ACTIONS.GET_CART,
      data: {
        id: CONST.ACTIONS.GET_CART,
      },
    },
  };
  return element;
}
function moreButtonToElement(sliceStart, sliceEnd) {
  const element = {
    text: 'עוד',
    image_url:"https://visualpharm.com/assets/482/Shopping%20Cart-595b40b65ba036ed117d241c.svg",
    clickData: {
      action: CONST.ACTIONS.MORE,
      data: {
        sliceStart: sliceStart,
        sliceEnd: sliceEnd,
      },
    },
  };
  return element;
}

function itemToElement(item, itemId, lang, actions = []) {
  const element = {
    title: item.name,
    description: item.desc,
    actions,
  };
  if (item.image) {
    var image = item.image.substring(2, item.image.length);
    element.imageUrl = image;
  }
  return element;
}

module.exports = {handle};
