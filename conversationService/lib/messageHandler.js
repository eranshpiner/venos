'use strict';

const providers = require('./providers');
const CONST = require('./dataModel/const');

const menu = require('./../customers/niniHachi.json');

function handle(message) {
  const provider = providers[message.provider];


  if (message.action) {
    const curItem = (message.actionData && message.actionData.id) ? menu.items[message.actionData.id] : undefined;

    if (message.action === CONST.ACTIONS.CLICK_ITEM) {
      if (curItem && curItem.items) {
        message.response.elements = getItems(menu.items, message.actionData.id);
      } else {
        message.response.content = `oh nooooo, category ${message.actionData.id} has no items.`;
      }
    } else if (message.action === CONST.ACTIONS.ADD_TO_CART) {
      message.response.content = `Thank for Choosing ${curItem.title.he_IL} has been added to cart.`;
      // TODO: cart
      //in general the add cart should understand from the session manager how many items there are in and from there to build the response
      addCart(message,menu);
      addCategories(message, menu.items, true);
    } else if (message.action === CONST.ACTIONS.PAY) {
      message.response.content = `You're being forwarded to our payment system to complete your order`;
      // TODO: cart
      addCategories(message, menu.items, true);
    }
  } else {
    message.response.content = menu.welcome.he_IL;
    addCategories(message, menu.items, true);
  }

  provider.sendMessage(message);
}

function addCart(message, menu, lang = 'he_IL') {
  message.response.replies = message.response.replies || [];
  message.response.replies = message.response.replies.concat(cartToElement(menu.items['cart'], 'cart', lang));
}

function getItems(items, categoryId, lang = 'he_IL') {
  const category = items[categoryId];
  const res = [];
  if (category && category.items) {
    category.items.forEach(itemId => {
      if (items[itemId]) {
        res.push(itemToElement(items[itemId], itemId, lang));
      }
    });
  }
  return res;
}

function addCategories(message, items, onlyTopLevel = false, lang = 'he_IL') {
  message.response.replies = message.response.replies || [];
  const elements = [];
  Object.entries(items).forEach(([itemId, item]) => {
      if (onlyTopLevel && !item.topLevel) {
        return;
      }
      elements.push(categoryToElement(item, itemId, lang));
    }
  );
  message.response.replies = message.response.replies.concat(elements.splice(0, 9)); // todo limit 9 + cart...
}

function categoryToElement(item, itemId, lang) {
  const element = {
    title: item.title ? item.title[lang] : '',
    description: item.description ? item.description[lang] : '',
    payload: {
      action: CONST.ACTIONS.CLICK_ITEM,
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

function cartToElement(item, itemId, lang) {
  let elem = categoryToElement(item, itemId, lang);
  elem.payload = {
    action: CONST.ACTIONS.PAY,
    data: {
      id: itemId,
    }
  };
  return elem;
}

function itemToElement(item, itemId, lang) {
  const element = {
    title: item.title[lang],
    description: item.description[lang],
    actions: [{
      title: 'Add', // TODO
      payload: {
        action: CONST.ACTIONS.ADD_TO_CART,
        data: {
          id: itemId,
        },
      }
    }],
  };
  if (item.image_url) {
    element.image_url = item.image_url;
  }
  return element;
}

module.exports = {handle};
