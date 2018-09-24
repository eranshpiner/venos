const builder = require('botbuilder');

const menuUtils = require('./../../util/menu');
const cartUtils = require('./../../util/cart');

const FLOWS = require('./../../const/flows');
const MESSAGES = require('./../../const/messages');

const PER_LIST = {
  'facebook': 4,
};

function chunks(array = [], size = 0) {
  const results = [];
  while (array.length) {
    if ((array.length - size) > 0 && array.length < (size * 2)) {
      results.push(array.splice(0, size - 1));
    } else {
      results.push(array.splice(0, size));
    }
  }
  return results;
}


module.exports = ({botId, bot, provider, customer}) => {
  const perList = PER_LIST[provider.name];

  const categoriesReplies = menuUtils.getCategoriesReplies({customer, provider});

  bot.dialog(FLOWS.CART.ROOT, [
    (session, args, next) => {
      const context = session.userData;
      const cart = context.cart || [];

      if (cart.length === 0) {
        session.send(MESSAGES.CART.EMPTY({context, categories: categoriesReplies}));
        session.endDialog();
      } else {
        const total = cartUtils.getCartSubTotal({cart, customer});
        const itemsChunks = chunks(cartUtils.getCartItems({customer, provider, context}), perList);
        const buttons = [provider.createButton('הזמן עכשיו', cartUtils.getPaymentURL({botId, customer, context, provider}))];

        itemsChunks.forEach(items => session.send(MESSAGES.CART.CART_ITEMS({context, items, buttons})));

        session.send(MESSAGES.CART.CART_TOTAL({context, items: cart.length, total, categories: categoriesReplies}));
        session.endDialog();
      }
    },
  ]);
};
