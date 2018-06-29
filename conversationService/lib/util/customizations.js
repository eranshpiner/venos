const CONST = require('./../const');
const generics = require('./generics');

function getItemCustomization(item) {
  const customizationItem = item.menuItem.CategoriesAdd[item.customizationItemPosition];
  // TODO: handle scenario where all customizations were already selected
  if (customizationItem.single) {
    const items = [];
    customizationItem.itemsAdd.forEach((addItem) => {
      const exists = item.item.customizations[customizationItem.id] && item.item.customizations[customizationItem.id].includes(addItem.id);
      if (!exists) {
        items.push(generics.itemToElement(addItem, null, null, [{
          text: 'הוסף',
          clickData: {
            action: CONST.ACTIONS.CHOOSE_CUSTOMIZATION,
            data: {
              id: addItem.id,
              categoryId: customizationItem.id,
              isSingle: true,
            },
          }
        }]));
      }
    });
    item.customizationItemPosition += 1;

    const replies = [{
      text: 'אני אוותר',
      clickData: {
        action: CONST.ACTIONS.CHOOSE_CUSTOMIZATION,
        data: {
          id: -1,
        },
      },
    }];

    return [
      {
        type: CONST.RESPONSE_TYPE.TEXT,
        text: customizationItem.name,
      },
      {
        type: CONST.RESPONSE_TYPE.ITEM_CUSTOMIZATIONS,
        items,
        replies,
      }];
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
      const exists = item.item.customizations[customizationItem.id] && item.item.customizations[customizationItem.id].includes(addItem.id);
      if (!exists) {
        replies.push({
          text: addItem.name,
          clickData: {
            action: CONST.ACTIONS.CHOOSE_CUSTOMIZATION,
            data: {
              id: addItem.id,
              categoryId: customizationItem.id,
            },
          },
        });
      }
    });
    return [
      {
        type: CONST.RESPONSE_TYPE.TEXT,
        text: customizationItem.name,
        replies,
      }];
  }
}

function addCustomization(currentItem, customizationId, customizationCategoryId) {
  currentItem.item.customizations[customizationCategoryId] = currentItem.item.customizations[customizationCategoryId] || [];
  currentItem.item.customizations[customizationCategoryId].push(customizationId);
}

function hasMoreItems(currentItem) {
  const customizationItem = currentItem.menuItem.CategoriesAdd[currentItem.customizationItemPosition];
  if (!customizationItem) {
    return false;
  }
  const existingCustomizations = currentItem.item.customizations && currentItem.item.customizations[customizationItem.id];
  return !(existingCustomizations && existingCustomizations.length === customizationItem.itemsAdd.length);
}

module.exports = {
  hasMoreItems,
  getItemCustomization,
  addCustomization,
};
