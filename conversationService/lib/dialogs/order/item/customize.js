const builder = require('botbuilder');

const menuUtils = require('../../../util/menu');
const cartUtils = require('../../../util/cart');
const textUtils = require('../../../util/text');

const FLOWS = require('../../../const/flows');
const MESSAGES = require('../../../const/messages');

const PER_PAGE = {
  'facebook': 10
};
const MORE_OPTIONS = 'עוד אפשרויות';
const ALL_GOOD = 'אני אוותר';

module.exports = ({bot, provider, customer}) => {
  const perPage = PER_PAGE[provider.name];

  const moreItem = {
    title: MORE_OPTIONS,
    buttons: [{
      title: MORE_OPTIONS,
      type: 'postback',
      payload: MORE_OPTIONS,
    }],
  };

  function itemMapper(item, categoryId) { // TODO: find proper place.
    const element = {
      title: item.name,
      buttons: [{
        title: item.name.length > 15 ? 'הוסף' : `הוסף ${item.name}`, // TODO: is this cool?
        type: 'postback',
        payload: item.name,
      }],
    };
    const description = [];
    if (item.price) {
      description.push(`בתוספת ${item.price}₪\n`);
    }
    if (item.desc) {
      description.push(textUtils.sanitizeHtml(item.desc));
    }
    if (description.length) {
      element.subtitle = description.join('\n');
    }
    if (item.image) {
      element.image_url = item.image.substring(2, item.image.length);
    } else {
      element.image_url = "https://afs.googleusercontent.com/gumtree-com/noimage_thumbnail_120x92_v2.png";
    }
    return element;
  }

  function promptCustomization({context, session, customizationItem, customizations, pageNumber = 1}) {
    const categoryCustomizations = customizations[customizationItem.id] = customizations[customizationItem.id] || [];

    let availableItems = customizationItem.itemsAdd.filter(item => !categoryCustomizations.includes(item.id));
    let hasMore = false;
    if (availableItems.length > perPage) {
      const totalPages = Math.ceil((availableItems.length / (perPage - 1)));
      if (pageNumber > totalPages) {
        pageNumber = 1;
      }
      const page = pageNumber - 1;
      availableItems = availableItems.slice(page * (perPage - 1), (page + 1) * (perPage - 1));
      hasMore = totalPages > pageNumber;
    }

    if (customizationItem.single) {
      const items = availableItems.map(itemMapper);
      if (hasMore) {
        items.push(Object.assign({}, moreItem));
      }
      session.send(MESSAGES.ORDER.ITEM.CUSTOMIZATIONS.CHOOSE_SINGLE_TITLE({context, title: customizationItem.name}));
      session.send(MESSAGES.ORDER.ITEM.CUSTOMIZATIONS.CHOOSE_SINGLE_ITEMS({context, items, replies: [ALL_GOOD] }));
    } else {
      const items = availableItems.map(item => item.name);
      if (hasMore) {
        items.unshift(MORE_OPTIONS);
      }
      items.unshift(ALL_GOOD);
      session.send(MESSAGES.ORDER.ITEM.CUSTOMIZATIONS.CHOOSE_MULTIPLE_ITEMS({context, title: customizationItem.name, items}));
    }
  }

  bot.dialog(FLOWS.ORDER.ITEM.CUSTOMIZATIONS,
    new builder.IntentDialog()
      .onBegin((session, args = {}) => {
        const context = session.userData;
        session.dialogData.categoryId = args.categoryId;
        session.dialogData.itemId = args.itemId;
        session.dialogData.pageNumber = args.pageNumber || 1;

        session.dialogData.menuItem = menuUtils.getItem(customer, session.dialogData.categoryId, session.dialogData.itemId);
        session.dialogData.customizations = {};

        session.dialogData.currentCustomizationCategory = 0;
        session.dialogData.totalCustomizationCategories = session.dialogData.menuItem.CategoriesAdd.length;

        promptCustomization({
          context,
          session,
          customizationItem: session.dialogData.menuItem.CategoriesAdd[session.dialogData.currentCustomizationCategory],
          customizations: session.dialogData.customizations,
        });
      })
      .matches(new RegExp(MORE_OPTIONS), (session) => {
        const context = session.userData;
        session.dialogData.pageNumber += 1;
        promptCustomization({
          context,
          session,
          customizationItem: session.dialogData.menuItem.CategoriesAdd[session.dialogData.currentCustomizationCategory],
          customizations: session.dialogData.customizations,
          pageNumber: session.dialogData.pageNumber
        });
      })
      .matches(new RegExp(ALL_GOOD), (session) => {
        session.dialogData.currentCustomizationCategory += 1;

        if (session.dialogData.currentCustomizationCategory >= session.dialogData.totalCustomizationCategories) {
          session.endDialogWithResult({customizations: session.dialogData.customizations });
        } else {
          promptCustomization({
            session,
            customizationItem: session.dialogData.menuItem.CategoriesAdd[session.dialogData.currentCustomizationCategory],
            customizations: session.dialogData.customizations,
          });
        }
      })
      .onDefault((session, args) => {
        const context = session.userData;
        const customizations = session.dialogData.customizations;
        const customizationItem = session.dialogData.menuItem.CategoriesAdd[session.dialogData.currentCustomizationCategory];
        const selectedItem = customizationItem.itemsAdd.find(item => item.name === session.message.text);
        if (!selectedItem) {
          session.send(MESSAGES.ORDER.ITEM.CUSTOMIZATIONS.RETRY_CHOICES({context}));
          promptCustomization({
            session,
            customizationItem: session.dialogData.menuItem.CategoriesAdd[session.dialogData.currentCustomizationCategory],
            customizations,
          });
        } else {
          customizations[customizationItem.id].push(selectedItem.id);
          if (customizationItem.single || customizations[customizationItem.id].length === customizationItem.itemsAdd.length) {
            session.dialogData.currentCustomizationCategory += 1;
          }

          if (session.dialogData.currentCustomizationCategory >= session.dialogData.totalCustomizationCategories) {
            session.endDialogWithResult({customizations: session.dialogData.customizations });
          } else {
            promptCustomization({
              session,
              customizationItem: session.dialogData.menuItem.CategoriesAdd[session.dialogData.currentCustomizationCategory],
              customizations,
            });
          }
        }

      }),
    );

};
