const builder = require('botbuilder');

const FLOWS = require('./../../../const/flows');
const MESSAGES = require('./../../../const/messages');

module.exports = ({bot, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.FLOOR_APT_ENT, [
    (session) => {
      const context = session.userData;
      if (!context.deliveryInfo) {
        session.replaceDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.AUTO);
      } else if (!context.deliveryInfo.houseNumber) {
        builder.Prompts.text(session, MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.FLOOR_APT_ENT({context, customer}));
      } else {
        session.endDialog();
      }
    },
    (session, results) => {
      if (!results.response || !results.response.entity) {
        // TODO: handle misscommunication
        return;
      }
      const context = session.userData;
      context.deliveryInfo.houseNumber = results.response.entity; // TODO: split to houseNumber, floor, entrance
      session.endDialog();
    }
  ]);
};
