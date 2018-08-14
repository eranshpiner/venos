const builder = require('botbuilder');

const menuUtils = require('./../../util/menu');
const textUtils = require('./../../util/text');

const FLOWS = require('./../../const/flows');
const MESSAGES = require('./../../const/messages');

const PER_PAGE = {
  'facebook': 9,
};

module.exports = ({bot, provider, customer}) => {
  const perPage = PER_PAGE[provider.name];
  const categoriesReplies = menuUtils.getCategoriesReplies({customer, provider});

  function itemMapper(item, categoryId) { // TODO: find proper place.
    const element = {
      title: item.name,
      buttons: [{
        title: item.name.length > 15 ? 'הוסף' : `הוסף ${item.name}`, // TODO: is this cool?
        type: 'postback',
        payload: `action?addItem?${categoryId}|${item.id}`
      }],
    };
    const description = [];
    if (item.price) {
      description.push(`${item.price}₪\n`);
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

  function getItems(categoryId, pageNumber) {
    const totalItems = menuUtils.getTotalItems(customer, categoryId);
    const totalPages = Math.ceil(totalItems / perPage);
    const items = menuUtils.getItems(customer, categoryId, pageNumber, perPage)
      .map(item => itemMapper(item, categoryId));
    if (totalPages > 1 && pageNumber !== totalPages) {
      //items.unshift({title: 'עוד', buttons: 'nextItemsPage'}); // TODO: paging
    }
    return items;
  }

  bot.dialog(FLOWS.ORDER.CATEGORY,
    new builder.IntentDialog()
      .onBegin(async (session, args = {}) => {
        session.dialogData.pageNumber = parseInt(args.pageNumber, 10) || 1;
        session.dialogData.categoryId = args.categoryId;
        const context = session.userData;
        const category = menuUtils.getCategory(customer, session.dialogData.categoryId);
        if (!category) {
          // TODO
        }
        const items = getItems(session.dialogData.categoryId, session.dialogData.pageNumber);

        if (!items.length) {
          // TODO
        }
        if (category.desc) {
          session.send(MESSAGES.ORDER.CATEGORY.CATEGORY_DESCRIPTION({ context, description: textUtils.sanitizeHtml(category.desc) }));
        }
        session.send(MESSAGES.ORDER.CATEGORY.CHOOSE_ITEM({ context, items }));
        session.send(MESSAGES.ORDER.CATEGORY.OR_CHOOSE_ANOTHER_CATEGORY({ context, categories: categoriesReplies }));
      })
      .matches(/nextItemsPage/, (session) => {
        const context = session.userData;
        const items = getItems(session.dialogData.categoryId, session.dialogData.pageNumber);
        session.send(MESSAGES.ORDER.CATEGORY.CHOOSE_ITEM({context, items}));
        session.send(MESSAGES.ORDER.CATEGORY.OR_CHOOSE_ANOTHER_CATEGORY({ context, categories: categoriesReplies }));
      })
      .onDefault((session, args) => {
        const context = session.userData;
        const item = menuUtils.findItem(customer, session.dialogData.categoryId, session.message.text);
        if (item) {
          session.replaceDialog(FLOWS.ORDER.ITEM.ROOT, { categoryId: session.dialogData.categoryId, itemId: item.id });
        } else {
          const category = menuUtils.findCategory(customer, session.message.text);
          if (category) {
            session.replaceDialog(FLOWS.ORDER.CATEGORY, { categoryId: category.id });
          } else {
            session.send(MESSAGES.ORDER.CATEGORY.RETRY_ITEM({ context, categories: categoriesReplies }));
          }
        }

      })
  );

};
