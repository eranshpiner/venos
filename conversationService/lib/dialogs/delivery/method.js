const builder = require('botbuilder');

const FLOWS = require('./../../const/flows');
const MESSAGES = require('./../../const/messages');

const METHODS = {
  PICKUP: 'איסוף עצמי',
  SHIPPING: 'משלוח',
};

module.exports = ({bot, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.METHOD, [
    (session) => {
      const context = session.userData;
      if (!context.deliveryMethod) {
        const deliveryOptions = [METHODS.PICKUP, METHODS.SHIPPING];
        builder.Prompts.choice(session,
          MESSAGES.ORDER_DETAILS.DELIVERY.METHOD({context, customer, deliveryOptions}),
          deliveryOptions,
          { retryPrompt: MESSAGES.ORDER_DETAILS.DELIVERY.METHOD_RETRY({context, customer, deliveryOptions}) });
      } else {
        session.endDialog();
      }
    },
    (session, results) => {
      if (!results.response || !results.response.entity) {
        // TODO: handle misscommunication
        return;
      }
      let context = session.userData;
      context.deliveryMethod = results.response.entity || context.deliveryMethod;
      if (context.deliveryMethod === METHODS.PICKUP) {
        session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.PICKUP.ROOT);
      } else if (context.deliveryMethod === METHODS.SHIPPING) {
        session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ROOT);
      } else {
        // TODO: handle unexpected outcome
        session.endDialog();
      }
    },
    (session) => {
      session.endDialog();
    }
  ]);
};
