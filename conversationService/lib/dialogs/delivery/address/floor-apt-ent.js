const builder = require('botbuilder');

const FLOWS = require('./../../../const/flows');
const MESSAGES = require('./../../../const/messages');

module.exports = ({bot, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.FLOOR_APT_ENT, [
    (session) => {
      const context = session.userData;
      if (!context.deliveryInfo) {
        session.replaceDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ROOT);
      } else if (!context.deliveryInfo.apartment) {
        builder.Prompts.text(session, MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.FLOOR_APT_ENT({context, customer}));
      } else {
        session.endDialog();
      }
    },
    (session, results) => {
      if (!results.response) {
        // TODO: handle misscommunication
        session.endDialog();
        return;
      }
      const context = session.userData;
      context.deliveryInfo.apartment = results.response; // TODO: split to houseNumber, floor, entrance
      session.endDialog();
    }
  ]);
};
