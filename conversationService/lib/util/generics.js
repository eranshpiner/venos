const CONST = require('./../const');

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
    element.imageUrl = item.image.substring(2, item.image.length);
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
    element.imageUrl = item.image.substring(2, item.image.length);
  }
  return element;
}


function getItems(items, categoryId, lang = 'he_IL') {
  const category = items[categoryId];
  const res = [];
  if (category && category.items) {
    category.items.forEach(item => {
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

module.exports = {
  categoryToElement,
  itemToElement,
  cartButtonToElement,
  moreButtonToElement,
  getItems,
};
