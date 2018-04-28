'use strict';

const providers = require('./providers');
const sessionManager = require('./sessionManager');
const CONST = require('./const');

const menu = require('./../customers/niniHachi.json');

const handlers = {};


handlers[CONST.ACTIONS.CHOOSE_CATEGORY] = (message, userSession) => {
  const category = menu.items[message.actionData.id];
  if (category && category.items) {
    message.responses.push({
      elements: getItems(menu.items, message.actionData.id),
    });
  } else {
    message.responses.push({
      content: `oh nooooo, category ${message.actionData.id} has no items.`,
    });
  }
};

handlers[CONST.ACTIONS.ADD_TO_CART] = (message, userSession) => {
  const itemId = message.actionData.id;
  userSession.cart = userSession.cart || [];
  userSession.cart.push(itemId);
  message.responses.push({
    content: `hurray, item ${menu.items[itemId].title.he_IL} has been added to cart.`,
    replies: getCategories(menu.items, true),
  });
};

handlers[CONST.ACTIONS.REMOVE_FROM_CART] = (message, userSession) => {
  const itemId = message.actionData.id;
  userSession.cart = userSession.cart || [];
  userSession.cart.splice(userSession.cart.indexOf(itemId), 1); // TODO normal remove
  message.responses.push({
    content: `hurray, item ${menu.items[itemId].title.he_IL} has been removed from cart.`
  });
};

handlers[CONST.ACTIONS.GET_CART] = (message, userSession) => {
  const cart = userSession.cart;
  if (!cart || cart.length === 0) {
    message.responses.push({
      content: 'You have no items on your get, its time to get down to business!'
    });
  } else {
    message.responses.push({
      content: `You have ${cart.length} items in your cart`,
    });
    message.responses.push({
      elements: getCartItems(menu.items, userSession.cart),
    });
  }
};

async function handle(message) {
  const provider = providers[message.provider];
  const userSession = await sessionManager.getUserSession(message.userDetails);

  message.responses = message.responses || [];
  if (message.action) {
    if (handlers[message.action]) {
      handlers[message.action](message, userSession);
    } else {
      message.responses.push({
        content: `I don't know this one, ${message.action}`
      });
    }
  } else {
    message.responses.push({
      content: menu.welcome.en_US,
      replies: getCategories(menu.items, true),
    });
  }

  await sessionManager.saveUserSession(userSession);

  provider.sendMessage(message);
}


function getItems(items, categoryId, lang = 'he_IL') {
  const category = items[categoryId];
  const res = [];
  if (category && category.items) {
    category.items.forEach(itemId => {
      if (items[itemId]) {
        res.push(itemToElement(items[itemId], itemId, lang, [{
          title: 'Add', // TODO
          payload: {
            action: CONST.ACTIONS.ADD_TO_CART,
            data: {
              id: itemId,
            },
          }
        }]));
      }
    });
  }
  return res.splice(0, 10); // todo limit 10
}

function getCartItems(items, cartItems, lang = 'he_IL') {
  const res = [];
  cartItems.forEach(itemId => {
    if (items[itemId]) {
      res.push(itemToElement(items[itemId], itemId, lang, [{
        title: 'Remove', // TODO
        payload: {
          action: CONST.ACTIONS.REMOVE_FROM_CART,
          data: {
            id: itemId,
          },
        }
      }]));
    }
  });
  return res.splice(0, 10); // todo limit 10
}

function getCategories(items, onlyTopLevel = false, lang = 'he_IL') {
  const elements = [];
  Object.entries(items).forEach(([itemId, item]) => {
      if (onlyTopLevel && !item.topLevel) {
        return;
      }
      elements.push(categoryToElement(item, itemId, lang));
    }
  );
  return elements.splice(0, 10); // todo limit 10
}

function categoryToElement(item, itemId, lang) {
  const element = {
    title: item.title[lang],
    description: item.description[lang],
    payload: {
      action: CONST.ACTIONS.CHOOSE_CATEGORY,
      data: {
        id: itemId,
      },
    },
  };
  if (item.picture) {
    element.imageUrl = item.picture;
  }
  return element;
}

function itemToElement(item, itemId, lang, actions = []) {
  const element = {
    title: item.title[lang],
    description: item.description[lang],
    actions,
  };
  if (item.image_url) {
    element.image_url = item.image_url;
  }
  return element;
}

module.exports = {handle};
