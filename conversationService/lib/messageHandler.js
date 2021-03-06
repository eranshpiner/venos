const providers = require('./providers');
const sessionManager = require('./sessionManager');
const CONST = require('./const');
const cordsToAddress = require('./util/locations').cordsToAddress;
const strToAddress = require('./util/locations').strToAddress;
const locations = require('./util/locations');
const generics = require('./util/generics');
const customizationsUtil = require('./util/customizations');

const cartUtils = require('./util/cart');

const restConfigFile = require('./../customers/niniHachiMenu.json');
const menu = restConfigFile.rest.menu;
const branches = restConfigFile.rest.branches;

const handlers = {};

handlers[CONST.ACTIONS.ORDER_RECEIPT] = (message, userSession) => {
  let response = {
    type: CONST.RESPONSE_TYPE.TEXT,
  };

  response.text = `תודה על הזמנתך. מספר הזמנה: ${message.orderContext.transactionId} `;
  sessionManager.resetSession(userSession);
  message.responses.push(response);
  // let orderReceipt = {
  //   type: CONST.RESPONSE_TYPE.ORDER_RECEIPT
  //   orderContext: orderContext,
  //
  // };
  // message.responses.push(orderReceipt);

}

handlers[CONST.ACTIONS.APPROVE_DELIVERY_ADDRESS] = (message, userSession) => {
  let response = {};
  userSession.waitingForApartmentNumber = true;

  const address = message.actionData.address;

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: "מה מס בית ודירה או כניסה?"
  });

  // message.responses.push({
  //   type: CONST.RESPONSE_TYPE.TEXT,
  //   text: 'בחר קטגוריה',
  //   replies: getCategories(menu.items, true),
  // });

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
  const category = menu.items[message.actionData.id];
  if (category && category.items) {
    if (category.desc) {
      message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: generics.sanitizeHtml(category.desc),
      });
    }
    message.responses.push({
      type: CONST.RESPONSE_TYPE.ITEMS,
      items: generics.getItems(menu.items, message.actionData.id),
      replies: getCategories(menu.items, true),
    });
  } else {
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: ` אוי לא אין פריטים בקטגוריה${message.actionData.id} `,
      replies: getCategories(menu.items, true),
    });
  }
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'למעלה תוכל למצוא את המנות שבקטגוריה שבחרת או פשוט תבחר קטגוריה אחרת',
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.MORE] = (message, userSession) => {
  const sliceStart = message.actionData.sliceStart;
  const sliceEnd = message.actionData.sliceEnd;

  // message.responses.push(response);
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'קבל עוד אופציות',
    replies: getCategories(menu.items, true, sliceStart, sliceEnd),
  });

};

handlers[CONST.ACTIONS.CART_ITEM_OPTIONS] = (message, userSession) => {
  const itemId = message.actionData.id;
 //const customizationItem = item.menuItem.CategoriesAdd[item.customizationItemPosition];
  const categoryId = message.actionData.categoryId;
  const menuItem = menu.items[categoryId].items.find((e) => e.id === itemId);



    message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'מה תרצה לשנות?',
      replies: [{
        text: 'לתקן',
        clickData: {
          action: CONST.ACTIONS.ADD_TO_CART,
          data: {
            id: itemId,
            categoryId: categoryId,
            deletePreviouslyAddedItem: true
          },
        },
      },
        {
          text: 'להסיר',
          clickData: {
            action: CONST.ACTIONS.REMOVE_FROM_CART,
            data: {
              id: itemId,
              categoryId: categoryId,
              name: menuItem.name
            },
          },
        },
        {

          text: '+',
          clickData: {
            action: CONST.ACTIONS.ADD_TO_CART,
            data: {
              id: itemId,
              categoryId: categoryId,
              deletePreviouslyAddedItem: false
            },
          },

        },
        {

          text: 'חזרה',
          type: CONST.REPLY_TYPE.TEXT,
          clickData: {
            //action: CONST.ACTIONS.CHOOSE_NOTES,
            data: {
              type: -1,
            },
          },

        }
      ],

  });

};


handlers[CONST.ACTIONS.ADD_TO_CART] = (message, userSession) => {
  const itemId = message.actionData.id;
  const deletePReviouslyAddedItem = message.actionData.deletePreviouslyAddedItem;
  const categoryId = message.actionData.categoryId;
  const menuItem = menu.items[categoryId].items.find((e) => e.id === itemId);
  const cart = userSession.cart = userSession.cart || [];
  const existingItem = cart.find((e) => e.id === itemId);

  if(deletePReviouslyAddedItem === true){

    const isReduceQuantity = false;
    userSession.cart = userSession.cart || [];

    const cartItemIndex = userSession.cart.findIndex((menuItem) => menuItem.id === itemId);
    const cartItem = userSession.cart[cartItemIndex];
    if (cartItemIndex === -1) {
      //TODO normal logging

    } else {
      if (isReduceQuantity && cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        //TODO normal logging
      } else {
        userSession.cart.splice(cartItemIndex, 1); // TODO normal remove
        //TODO normal logging
      }
    }

  }

  if (existingItem && !existingItem.hasCustomization) {
    existingItem.quantity += 1;
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: `הוספתי ${menuItem.name} נוסף, סה"כ ${existingItem.quantity}`,
      replies: getCategories(menu.items, true),
    });
    return;
  }

  if (!menuItem) {
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: `הפריט לא נמצא, אנא נסה פריט אחר`,
      replies: getCategories(menu.items, true),
    });
    return;
  }
  const cartItem = {
    id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    quantity: 1,
    categoryId: categoryId,
    customizations: {}
  };
  cart.push(cartItem);

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
      text: `יופי, הוספנו לך את `+ menuItem.name+ ' לעגלה',
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
      replies: [{
        type: CONST.REPLY_TYPE.TEXT,
        text: 'לא צריך',
        clickData: {
          action: CONST.ACTIONS.CHOOSE_NOTES,
          data: {
            type: -1,
          },
        },
      }],
    });
  } else {
    const customizations = customizationsUtil.getItemCustomization(userSession.currentItem);
    customizations.forEach(custRes => message.responses.push(custRes));
  }
};

handlers[CONST.ACTIONS.CHOOSE_NOTES]  = (message, userSession) => {
  userSession.currentItem.waitingForItemNotes = false;
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'מגניב! בוא נמשיך',
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.FIX_DELIVERY_ADDRESS]  = (message, userSession) => {
  userSession.waitingForCity = true; //TODO send to log waiting for address
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'לאיזו עיר לשלוח?',
  });
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
    response.text = `סליחה לא מצאתי את  ${itemName} בעגלה `;
  } else {
    if (isReduceQuantity && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      response.text = `הסרתי את  ${itemName} בהורדתי את הכמות ל ${cartItem.quantity}.`;
      response.replies = getCategories(menu.items, true);
    } else {
      userSession.cart.splice(cartItemIndex, 1); // TODO normal remove
      response.text = `מחקתי את  ${itemName} מהעגלה .`;
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

    const cartTotal = cartUtils.getCartSubTotal(cart);
    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text: `סה"כ ${cart.length} פריטים על סך ${cartTotal}₪`,
      replies: getCategories(menu.items, true),
    });
  }
};

handlers[CONST.ACTIONS.EMPTY_CART] = (message, userSession) => {
  userSession.cart = [];
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'כל הפריטים בעגלה הוסרו',
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.CHOOSE_DELIVERY_METHOD] = (message, userSession) => {
  if (message.actionData && message.actionData.method) {
    userSession.deliveryMethod = message.actionData.method;
  }

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: `אנא הזן את הכתובת למשלוח למשל\n דיזנגוף 22 תל אביב`,
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

handlers[CONST.ACTIONS.APPROVE_PICKUP_TIME] = async (message, userSession) => {
 userSession.chosenPickUpTime = message.actionData.time;
  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'מעולה ההזמנה תחכה לך בסניף ' +userSession.branchForPickup+ ' תוכל לאסוף בשעה ' +userSession.chosenPickUpTime,
  });

  message.responses.push({
    type: CONST.RESPONSE_TYPE.TEXT,
    text: 'בוא נתחיל, מה תרצה להזמין?',
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.CHOOSE_DELIVERY_METHOD_PICKUP] = async (message, userSession) => {

  //If the restaurant has only one branch, we pick the data from the only branch configured. If not, we need to
  //ask the consumer to pick up a branch maybe based on their location.
  if(branches.length == 1) {  //TODO: Add branch selection by location proximity.

    const branchPickupTimeInMinutes = branches[0].branchPickUpTimeInMinutes; // Defined at the rest conf file per branch
    const branchTimeZoneOffsetInMinutes = branches[0].branchTimeZoneOffset; // Defined in the rest conf file per branch
    userSession.branchForPickup = branches[0].branchName;
    userSession.branchForPickupId = branches[0].branchId;
    userSession.branchAddress = branches[0].branchAddress;

    message.responses.push({
      type: CONST.RESPONSE_TYPE.TEXT,
      text:   'תבחר מתי נוח לך לבוא לקחת \nתוכל לאסוף מסניף ' + branches[0].branchName + '\n אלה הזמנים הפנויים להיסוף. ',
      replies: [
        {
          type: CONST.REPLY_TYPE.TEXT,
          text: msToHMS(Date.now() + (branchPickupTimeInMinutes + branchTimeZoneOffsetInMinutes) * 60000),
            clickData: {
            action: CONST.ACTIONS.APPROVE_PICKUP_TIME,
            data: {
              action: CONST.ACTIONS.APPROVE_PICKUP_TIME,
              time: msToHMS(Date.now() + (branchPickupTimeInMinutes + branchTimeZoneOffsetInMinutes) * 60000),
            },
          },
        },
        {
          type: CONST.REPLY_TYPE.TEXT,
          text:  msToHMS(Date.now() + (branchPickupTimeInMinutes + 40 + branchTimeZoneOffsetInMinutes) * 60000),
          clickData: {
            action: CONST.ACTIONS.APPROVE_PICKUP_TIME,
            data: {
              action: CONST.ACTIONS.APPROVE_PICKUP_TIME,
              time: msToHMS(Date.now() + (branchPickupTimeInMinutes + 40 + branchTimeZoneOffsetInMinutes) * 60000)
            },
          },
        },
        {
          type: CONST.REPLY_TYPE.TEXT,
          text: msToHMS(Date.now() + (branchPickupTimeInMinutes + 80 + branchTimeZoneOffsetInMinutes) * 60000),
          clickData: {
            action: CONST.ACTIONS.APPROVE_PICKUP_TIME,
            data: {
              action: CONST.ACTIONS.APPROVE_PICKUP_TIME,
              time:msToHMS(Date.now() + (branchPickupTimeInMinutes + 80 + branchTimeZoneOffsetInMinutes) * 60000)
            },
          },
        }
      ]
    });
  }
};

async function handle(message) {
  const provider = providers[message.provider];
  const userSession = await sessionManager.getUserSession(message);

  userSession.locale = userSession.locale || 'he_IL';
  message.responses = message.responses || [];
  if (message.action) {
    if (handlers[message.action]) {
      await handlers[message.action](message, userSession);
    } else {
      message.responses.push({
        type: CONST.RESPONSE_TYPE.TEXT,
        text: `לא מכיר את זה, ${message.action}`
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
    else if (userSession.waitingForCity === true){
      cityInput = await strToAddress(message.messageContent);
      if(cityInput.length === 1){
        userSession.waitingForCity = false;
        userSession.waitingForStreet = true;
        userSession.address += message.messageContent;
        message.responses.push({
          type: CONST.RESPONSE_TYPE.TEXT,
          text: message.messageContent + ' מכיר\n מה שם הרחוב ומספר בית?',

        });
      } else if (cityInput.length < 1){
        message.responses.push({
          type: CONST.RESPONSE_TYPE.TEXT,
          text: 'לא מכיר עיר כזאות, אולי תנסה אחרת?',
        });

      } else {
        //TODO: send the list of responses as QR for the user to decide
      }
    }
    else if (userSession.waitingForStreet === true){
      street = await strToAddress(message.messageContent);
      if(street.length === 1){
        userSession.waitingForApartmentNumber = true;
        userSession.waitingForStreet = false;
        userSession.address += message.messageContent;
        message.responses.push({
          type: CONST.RESPONSE_TYPE.TEXT,
          text: 'מה מספר דירה או כניסה?',

        });
      } else if (street.length < 1){
        message.responses.push({
          type: CONST.RESPONSE_TYPE.TEXT,
          text: 'לא מצאתי רחוב כזה אולי תנסה אחרת?',
        });

      } else {
        //TODO: send the list of responses as QR for the user to decide
      }
    }
    else if (userSession.waitingForApartmentNumber === true){
        userSession.waitingForApartmentNumber = false;
        userSession.address += message.messageContent;
        message.responses.push({
          type: CONST.RESPONSE_TYPE.TEXT,
          text:'מצויין נשלח ל '+userSession.address+ '\n בוא נתחיל, תבחר מהקטגוריות',
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
            action: CONST.ACTIONS.CHOOSE_DELIVERY_METHOD_PICKUP,
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

function msToHMS( duration ) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  var m = (parseInt((minutes + 7.5)/15) * 15) % 60;
  var h = minutes > 52 ? (hours === 23 ? 0 : ++hours) : hours;

  return h + ":" + m;
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
  elements.unshift(generics.cartButtonToElement());
  elements.unshift(generics.moreButtonToElement(sliceStart, sliceEnd));
  return elements;
}

module.exports = {handle};
