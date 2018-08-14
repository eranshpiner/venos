const builder = require('botbuilder');

const FLOWS = require('./../../const/flows');
const MESSAGES = require('./../../const/messages');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.PICKUP.ROOT, [
    (session, args, next) => {
      const context = session.userData;
      session.send(MESSAGES.ORDER_DETAILS.DELIVERY.PICKUP.ACKNOWLEDGE({context}));
      session.endDialog();
    },
  ]);
};
