const builder = require('botbuilder');

const FLOWS = require('./../../const/flows');
const MESSAGES = require('./../../const/messages');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ROOT, [
    (session, args, next) => {
      const context = session.userData;
      if (!context.deliveryInfo || !context.deliveryInfo.city || !context.deliveryInfo.street) {
        session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.AUTO);
      } else {
        next();
      }
    },
    (session, results, next) => {
      const context = session.userData;
      if (!context.deliveryInfo.houseNumber) {
        session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.FLOOR_APT_ENT);
      } else {
        next();
      }
    },
    (session) => {
      const context = session.userData;
      session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.CONFIRM({context}));
      session.endDialog();
    },
  ]);
};
