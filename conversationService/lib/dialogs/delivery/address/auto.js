const builder = require('botbuilder');

const locationsUtil = require('./../../../util/locations');

const FLOWS = require('./../../../const/flows');
const MESSAGES = require('./../../../const/messages');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.AUTO,
    new builder.IntentDialog()
      .onBegin((session, args) => {
        const context = session.userData;
        session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.ENTER_ADDRESS({context, customer, api: provider.api}));
      })
      .matches(/תקן|לא/, (session) => {
        const context = session.userData;
        delete context.deliveryInfo;
        session.replaceDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.ROOT);
      })
      .matches(/אשר|כן/, (session) => {
        session.endDialog();
      })
      .onDefault(async (session, args) => {
        const context = session.userData;
        const attachment = session.message.attachments && session.message.attachments[0];
        let address;
        if (attachment && attachment.type === 'location') {
          address = await locationsUtil.locationLookup(attachment.value);
        } else if (session.message.text) {
          address = await locationsUtil.addressLookup(session.message.text);
        }

        if (address) {
          if (address.length === 1) {
            context.deliveryInfo = address[0];
            session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.APPROVE_ADDRESS({context, address: context.deliveryInfo.label}));
          } else {
            session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.CHOOSE_ADDRESS({context, address: address.map(a => a.label)}));
          }
        } else {
          session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.NO_ADDRESS({context}));
          session.replaceDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.ROOT);
        }
      })
  );
};
