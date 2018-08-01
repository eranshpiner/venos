const CONST = require('./../const');

function sanitizeHtml(string = '') {
  return string
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (match, num) => String.fromCharCode(num))
    .replace(/&#x([A-Za-z0-9]+);/g, (match, num) => String.fromCharCode(parseInt(num, 16)))
    .replace(/(<([^>]+)>)/ig, '');
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
    element.imageUrl = item.image.substring(2, item.image.length);
  }

  return element;
}

function cartButtonToElement() {
  const element = {
    text: 'עגלה',
    image_url:"",
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
    text: 'עוד...',
    image_url:"",
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
    actions,
  };
  let description = [];
  if (item.price) {
    description.push(`${item.price}₪\n`);
  }
  if (item.desc) {
    description.push(sanitizeHtml(item.desc));
  }
  if (description.length) {
    element.description = description.join('\n');
  }
  if (item.image) {
    element.imageUrl = item.image.substring(2, item.image.length);
  } else {
    element.imageUrl = "https://afs.googleusercontent.com/gumtree-com/noimage_thumbnail_120x92_v2.png";
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
  sanitizeHtml,
  categoryToElement,
  itemToElement,
  cartButtonToElement,
  moreButtonToElement,
  getItems,
};
