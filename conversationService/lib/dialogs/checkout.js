const log = require('./../util/log')('WelcomeDialog');
const MESSAGES = require('./../const/messages');
const FLOWS = require('./../const/flows');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.CHECKOUT.RESULT.ROOT, [
    (session, args, next) => {
      const orderContext = session.message.attachments && session.message.attachments[0];
      log.debug(orderContext);
      session.send({text: 'Thank you for your order!'});
      next();
    },
    (session, results) => {
      session.endDialog();
    }
  ]);
};
