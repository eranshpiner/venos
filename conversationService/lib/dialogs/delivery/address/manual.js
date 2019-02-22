const builder = require('botbuilder');

const locationsUtil = require('./../../../util/locations');

const FLOWS = require('./../../../const/flows');
const MESSAGES = require('./../../../const/messages');

module.exports = ({bot, customer}) => {
  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.ROOT, [
    (session) => {
      session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.CITY);
    },
    (session) => {
      session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.STREET);
    },
    (session) => {
      session.beginDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.HOUSE_NUMBER);
    },
    (session) => {
      session.endDialog();
    }
  ]);

  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.CITY,
    new builder.IntentDialog()
      .onBegin((session) => {
        const context = session.userData;
        session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.CITY.ENTER_CITY({context, customer}));
      })
      .onDefault(async (session) => {
        const context = session.userData;
        const city = await locationsUtil.cityLookup(session.message.text);
        if (!city || city.length === 0) {
          session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.CITY.RETRY_CITY({context, customer}));
        } else if (city.length === 1) {
          context.deliveryInfo = context.deliveryInfo || {};
          context.deliveryInfo.city = city[0].city;
          context.deliveryInfo.cityMapView = city[0].cityMapView;
          console.log(context.deliveryInfo)
          session.endDialog();
        } else {
          session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.CITY.CHOOSE_CITY({context, customer, cities: city.map(c => c.city)}));
        }
      })
  );

  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.STREET,
    new builder.IntentDialog()
      .onBegin((session, args) => {
        const context = session.userData;
        session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.STREET.ENTER_STREET({context, customer}));
      })
      .onDefault(async (session) => {
        const context = session.userData;
        const streets = await locationsUtil.streetLookup(context.deliveryInfo.city, session.message.text, context.deliveryInfo.cityMapView);
        if (!streets || streets.length === 0) {
          session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.STREET.RETRY_STREET({context, customer}));
        } else if (streets.length === 1) {
          context.deliveryInfo = context.deliveryInfo || {};
          context.deliveryInfo.street = streets[0];
          session.endDialog();
        } else {
          session.send(MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.STREET.CHOOSE_STREET({context, customer, streets}));
        }
      })
  );

  bot.dialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.HOUSE_NUMBER, [
    (session) => {
      const context = session.userData;
      if (!context.deliveryInfo) {
        session.replaceDialog(FLOWS.ORDER_DETAILS.DELIVERY.SHIPPING.ROOT);
      } else if (!context.deliveryInfo.houseNumber) {
        builder.Prompts.text(session, MESSAGES.ORDER_DETAILS.DELIVERY.SHIPPING.ADDRESS.MANUAL.HOUSE_NUMBER.ENTER_HOUSE_NUMBER({context, customer}));
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
      context.deliveryInfo.houseNumber = results.houseNumber; // TODO: split to houseNumber, floor, entrance
      session.endDialog();
    }
  ]);
};
