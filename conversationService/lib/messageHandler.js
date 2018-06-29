const providers = require('./providers');
const sessionManager = require('./sessionManager');
const CONST = require('./const');
const cordsToAddress = require('./util/locations').cordsToAddress;
const strToAddress = require('./util/locations').strToAddress;
const generics = require('./util/generics');
const customizationsUtil = require('./util/customizations');

const cartUtils = require('./util/cart');

const menu = require('./../customers/niniHachiMenu.json').rest.menu;

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

};

handlers[CONST.ACTIONS.CHOOSE_DELIVERY_ADDRESS] = (message, userSession) => {
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

};

handlers[CONST.ACTIONS.CHOOSE_CATEGORY] = (message, userSession) => {
  let response = {};

  const category = menu.items[message.actionData.id];
  if (category && category.items) {
    response.type = CONST.RESPONSE_TYPE.ITEMS;
    response.items = generics.getItems(menu.items, message.actionData.id);
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
  const itemId = message.actionData.id;
  const categoryId = message.actionData.categoryId;
  const menuItem = menu.items[categoryId].items.find((e) => e.id === itemId);
  userSession.cart = userSession.cart || [];

  if (!menuItem) {
    response.text = `Sorry, I couldn't find it on the menu, please try again.`;
  }
  const cartItem = {id: menuItem.id, quantity: 1, categoryId: categoryId, customizations: {}};
  userSession.cart.push(cartItem);

  if (menuItem.CategoriesAdd && menuItem.CategoriesAdd.length) {
    cartItem.hasCustomization = true;
    userSession.currentItem = {
      item: cartItem,
      menuItem,
      customizationItemPosition: 0,
      customizationItemsTotal: menuItem.CategoriesAdd.length,
    };
    const customizations = customizationsUtil.getItemCustomization(userSession.currentItem);
    customizations.forEach(custRes => message.responses.push(custRes));
  } else {
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: `hurray, item ${menuItem.name} has been added to cart.`,
      replies: getCategories(menu.items, true),
    });
  }
};

handlers[CONST.ACTIONS.CHOOSE_CUSTOMIZATION] = (message, userSession) => {
  const customizationId = message.actionData.id;
  const customizationCategoryId = message.actionData.categoryId;
  const currentItem = userSession.currentItem;

  if (customizationId === -1) {
    userSession.currentItem.customizationItemPosition += 1;
  } else {
    customizationsUtil.addCustomization(currentItem, customizationId, customizationCategoryId);
    if (!customizationsUtil.hasMoreItems(currentItem)) {
      userSession.currentItem.customizationItemPosition += 1;
    }
  }

  if (userSession.currentItem.customizationItemPosition >= userSession.currentItem.customizationItemsTotal) {
    userSession.currentItem.waitingForItemNotes = true;
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: 'במידה וישנם הערות נוספות למנה, אנא רשום אותם כעת',
    });
  } else {
    const customizations = customizationsUtil.getItemCustomization(userSession.currentItem);
    customizations.forEach(custRes => message.responses.push(custRes));
  }
};

handlers[CONST.ACTIONS.REMOVE_FROM_CART] = (message, userSession) => {
  let response = {
    type: CONST.RESPONSE_TYPE.TEXT,
  };
  const itemId = message.actionData.id;
  const itemName = message.actionData.name;
  const isReduceQuantity = message.actionData.reduceQuantity;
  userSession.cart = userSession.cart || [];

  const cartItemIndex = userSession.cart.findIndex((item) => item.id === itemId);
  const cartItem = userSession.cart[cartItemIndex];
  if (cartItemIndex === -1) {
    response.text = `Sorry, we couldn't find ${itemName} in your cart cart.`;
  } else {
    if (isReduceQuantity && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      response.text = `hurray, item ${itemName} has been reduced to ${cartItem.quantity}.`;
      response.replies = getCategories(menu.items, true);
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
      cartItems: cartUtils.getCartItems(cart, menu.items),
      cartActions: [
        {
          text: 'הזמן עכשיו',
          clickLink: cartUtils.getPaymentURL(userSession),
        },
      ],
      replies: getCategories(menu.items, true),
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
    if (userSession.currentItem && userSession.currentItem.waitingForItemNotes === true) {
      userSession.currentItem.waitingForItemNotes = false;
      userSession.currentItem.item.notes = message.messageContent;
      message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: 'מגניב! בוא נמשיך',
        replies: getCategories(menu.items, true),
      });
    }
    else if (!userSession.deliveryMethod) {
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
        if (!addresses.length) {
          message.responses.push({
            type: CONST.RESPONSE_TYPE.TEXT,
            text: `לא הצלחנו למצוא את הכתובת שהזנת, אנא הזן שנית`,
            replies: [{
              type: CONST.REPLY_TYPE.LOCATION,
            }],
          });
        } else if (addresses.length === 1) {
          userSession.deliveryAddress = addresses[0].address;
          message.responses.push({
            type: CONST.RESPONSE_TYPE.TEXT,
            text: `אנא אשר שהכתובת שהזנת הינה: ${addresses[0].address}`,
            replies: [{
              type: CONST.REPLY_TYPE.LOCATION,
            },
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
              }],
          });
        } else {
          message.responses.push({
            type: CONST.RESPONSE_TYPE.TEXT,
            text: `אנא בחר את האפשרות הכי מתאימה`
          });

          message.responses.push({
            type: CONST.RESPONSE_TYPE.ADDRESS_LIST,
            items: getPossibleAddresses(addresses)
          });
        }
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

function getCategories(items, onlyTopLevel = false, lang = 'he_IL', sliceStart, sliceEnd) {
  const elements = [];

  if (!sliceStart && !sliceEnd) {
    for (let i = 0, len = 7; i <= len; i++) {
      elements.push(generics.categoryToElement(items[i], i, lang));
    }
    sliceStart = 8;
    sliceEnd = 15;
  } else if (sliceEnd <= items.length) {

    for (let i = sliceStart, len = sliceEnd; i <= len; i++) {
      elements.push(generics.categoryToElement(items[i], i, lang, sliceStart, sliceEnd));
    }
    sliceStart += 8;
    sliceEnd += 8;

  } else {
    for (let i = sliceStart, len = items.length; i < len; i++) {
      elements.push(generics.categoryToElement(items[i], i, lang, sliceStart, items.length));
    }

  }
  elements.push(generics.cartButtonToElement());
  elements.push(generics.moreButtonToElement(sliceStart, sliceEnd));
  return elements;
}

module.exports = {handle};
