'use strict';

const providers = require('./providers');
const CONST = require('./dataModel/const');

const menu = require('./../customers/niniHachi.json');

function handle(message) {
  const provider = providers[message.provider];


  if (message.action) {
    if (message.action === CONST.ACTIONS.CHOOSE_CATEGORY) {
      const category = menu.items[message.actionData.id];
      if (category && category.items) {
        message.response.elements = getItems(menu.items, message.actionData.id);
      } else {
        message.response.content = `oh nooooo, category ${message.actionData.id} has no items.`;
      }
    } else if (message.action === CONST.ACTIONS.ADD_TO_CART) {
      message.response.content = `hurray, item ${message.actionData.id} has been added to cart.`;
      // TODO: cart
      message.response.replies = getCategories(menu.items, true);
    }
  } else {
    message.response.content = menu.welcome.en_US;
    message.response.replies = getCategories(menu.items, true);
  }

  provider.sendMessage(message);
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
