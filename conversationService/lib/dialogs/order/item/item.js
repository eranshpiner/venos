const builder = require('botbuilder');

const menuUtils = require('../../../util/menu');
const cartUtils = require('../../../util/cart');

const FLOWS = require('../../../const/flows');
const MESSAGES = require('../../../const/messages');

const ALL_GOOD = 'לא צריך'; // TODO: move from here

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.ORDER.ITEM.ROOT, [
    (session, args, next) => {
      const context = session.userData;
      context.cart = context.cart || [];
      const cart = context.cart;
      session.dialogData.categoryId = args.categoryId;
      session.dialogData.itemId = args.itemId;

      const menuItem = menuUtils.getItem(customer, session.dialogData.categoryId, session.dialogData.itemId);
      const cartItem = cart.find(cartItem => cartItem.id === menuItem.id);

      if (!menuItem) {
        // TODO.
      }

      if (menuUtils.hasCustomizations(menuItem)) {
        session.beginDialog(FLOWS.ORDER.ITEM.CUSTOMIZATIONS, session.dialogData);
      } else {
        next();
      }
    },
    (session, results) => {
      const context = session.userData;
      session.dialogData.customizations = results.customizations || {};
      builder.Prompts.text(session, MESSAGES.ORDER.ITEM.COMMENTS({context, customer}));
    },
    (session, results) => {
      const context = session.userData;
      const cart = context.cart;
      const customizations = session.dialogData.customizations;
      const item = menuUtils.getItem(customer, session.dialogData.categoryId, session.dialogData.itemId);
      let notes = '';
      if (results.response && results.response !== ALL_GOOD) {
        notes = results.response;
      }

      cartUtils.addToCart({cart, customer, item, customizations, notes, ...session.dialogData});
      session.send(MESSAGES.ORDER.ITEM.SUCCESSFULLY_ADDED({ context, item }));
      session.clearDialogStack();
      session.replaceDialog(FLOWS.ORDER.ROOT, { afterItemAdded: true });
    },
  ]);

};
