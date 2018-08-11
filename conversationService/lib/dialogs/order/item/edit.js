const builder = require('botbuilder');

const menuUtils = require('../../../util/menu');
const cartUtils = require('../../../util/cart');

const FLOWS = require('../../../const/flows');
const MESSAGES = require('../../../const/messages');

const ACTIONS = {
  CANCEL: 'חזרה',
  REMOVE: 'למחוק',
  EDIT: 'לערוך',
  REDUCE: '-',
  ADD: '+',
};

module.exports = ({bot, provider, customer}) => {

  function getActions(item) {
    const actions = [ACTIONS.CANCEL, ACTIONS.REMOVE];
    if (Object.keys(item.customizations)) {
      actions.push(ACTIONS.EDIT);
    }
    if (item.quantity > 1) {
      actions.push(ACTIONS.REDUCE);
    }
    return [...actions, ACTIONS.ADD];
  }

  bot.dialog(FLOWS.ORDER.ITEM.EDIT,
    new builder.IntentDialog()
      .onBegin((session, args = {}) => {
        const context = session.userData;
        const cart = context.cart;
        session.dialogData.itemId = args.itemId;

        const item = cart.find(item => item.id.toString() === session.dialogData.itemId.toString());
        session.send(MESSAGES.ORDER.ITEM.EDIT.CHOOSE_ACTION({ context, item, actions: getActions(item) }))
      })
      .matches(new RegExp(`\\${ACTIONS.ADD}`), (session) => {
        const context = session.userData;
        const cart = context.cart;

        const item = cart.find(item => item.id.toString() === session.dialogData.itemId.toString());

        item.quantity += 1;
        session.send(MESSAGES.ORDER.ITEM.EDIT.SUCCESSFULLY_INCREASED({context, item}));

        session.clearDialogStack();
        session.replaceDialog(FLOWS.CART.ROOT);
      })
      .matches(new RegExp(`\\${ACTIONS.REDUCE}`), (session) => {
        const context = session.userData;
        const cart = context.cart;

        const item = cart.find(item => item.id.toString() === session.dialogData.itemId.toString());

        item.quantity -= 1;
        session.send(MESSAGES.ORDER.ITEM.EDIT.SUCCESSFULLY_REDUCED({context}));

        session.clearDialogStack();
        session.replaceDialog(FLOWS.CART.ROOT);
      })
      .matches(new RegExp(ACTIONS.REMOVE), (session) => {
        const context = session.userData;
        const cart = context.cart;

        const idx = cart.findIndex(item => item.id.toString() === session.dialogData.itemId.toString());
        const item = cart[idx];

        cart.splice(idx, 1);
        session.send(MESSAGES.ORDER.ITEM.EDIT.SUCCESSFULLY_REMOVED({context, item}));

        session.clearDialogStack();
        session.replaceDialog(FLOWS.CART.ROOT);
      })
      .matches(new RegExp(ACTIONS.EDIT), (session) => {
        session.clearDialogStack();
        session.replaceDialog(FLOWS.ORDER.ITEM.CUSTOMIZATIONS, { isEdit: true, itemId: session.dialogData.itemId });
      })
      .matches(new RegExp(ACTIONS.CANCEL), (session) => {
        session.clearDialogStack();
        session.replaceDialog(FLOWS.CART.ROOT);
      })
      .onDefault((session) => {
        const context = session.userData;
        const cart = context.cart;

        const item = cart.find(item => item.id.toString() === session.dialogData.itemId.toString());
        session.send(MESSAGES.ORDER.ITEM.EDIT.RETRY_ACTION({ context, item, actions: getActions(item) }))
      })
  );

};
