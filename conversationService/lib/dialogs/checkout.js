const log = require('./../util/log')('WelcomeDialog');
const MESSAGES = require('./../const/messages');
const FLOWS = require('./../const/flows');
const cartUtils = require('./../util/cart');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.CHECKOUT.RESULT.ROOT, [
    (session, args, next) => {
      const {order, payment, transaction} = session.message.attachments && session.message.attachments[0];
      const receipt = cartUtils.getReceipt({customer, order, payment, transaction});
      session.send({receipt});
      next();
    },
    (session, results) => {
      const context = session.userData;
      context.cart = [];
      // TODO
      session.replaceDialog(FLOWS.WELCOME);
    }
  ]);
};
