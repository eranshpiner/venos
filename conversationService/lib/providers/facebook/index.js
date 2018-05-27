const messageHandler = require('./../../messageHandler');
const MESSAGE_TYPE = require('./const').MESSAGE_TYPE;
const transformer = require('./transformer');
const CONST = require('./const');

const router = require('express').Router();
const axios = require('axios');

const queue = [];
const config = {
  pageTokens: {
    // Nati
    '170386493680511': 'EAACUCGKSEZBEBAIJOM9BQhVynA5W3Fdwfi7pUjye2ZBgCmKXmhSRNweSHZB86YxiNjCZBH1Yk9SBvroAntwz9sHSpWsGlYO6wjIGi5FRsw3Cwp2gOxZBfQ2TXp2VAmZBlnxcjOUaoMim0fuLht8ZCcWbw7ZAsTGTVmKXo7foSC0YBAZDZD',
    // Oran - Page is Messanger101 Community
    '378370189311177': 'EAAXSuZCK0EJ0BAIuEnKSdaAnJtYwuwOCwcTohT1ZAEgktEeTHM9pRMifJwLRMJJZBsUdZBWOAe4AYgJDPM3MDZAsdSYGOR1VpZBJbHXNZB1UaKpzFDHPEdS3q134ss6IkMRKvugRF901yQqpJX4zkm1ZCSvZBTZC7CjESy8r2V9xQKkZCghEzZCDsMpv',
    //Production - MyRestaurant1
    '2055256904743938': 'EAAXV0ZAN3aacBAGjPAKp0eYF1WMBhv9QSxDDZAqinktIZAjuX5b9RNC6rVVK3ewdSYyws1ho7bc5Gc5IDkKkD7sLkZA4um9Io0ezdfHmxBLC7FLs0SXhcXJLeU6HEqZCkcUTCXqF8eWCBy8efVk3uv8ZBr8BOXDPPgNyctK8a45ZCbIVSZAT12Yp',
    //Seba -MyRestaurantPage
    '429412037508729':'EAAdtlL1xGsgBAORAm3xn99ZAcyOtpGj2pZAG49eiYee4FOOhZAw5Ky9NhZB7vaHypLFZCZBuQ0rvdONWvDlGOSoPNus10bsNXFAaRAJXPSME96nFbjdId64q5lzpsPXZADMSqi178WaHKejANAvevQU4aVF68vLvJUr4jgQ4UZAPvuHkDpq8XZA2x',
  }
};
const VERIFY_TOKEN = 'af5a72d5-c241-4472-b4ef-855b90165fd5';
const ENDPOINT = '/facebook';
const ignoredMessageTypes = [MESSAGE_TYPE.UNKNOWN,
                             MESSAGE_TYPE.ECHO,
                             MESSAGE_TYPE.DELIVERY,
                             MESSAGE_TYPE.READ];


// Token verification endpoint
router.get(ENDPOINT, (req, res) => {

  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('[Facebook] WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    res.status(500).end();
  }
});

router.post(ENDPOINT, (req, res) => {
  if (req.body && req.body.object === 'page') {
    res.status(200).send('EVENT_RECEIVED'); // we don't want FB to hate us if we fail so we respond first
    try {
      req.body.entry.forEach((entry) => {
        if (entry.messaging) {
          entry.messaging.forEach(fbMessage => {
            console.log('[Facebook] Incoming message', fbMessage);

            const message = transformer.from(fbMessage);
            if (!ignoredMessageTypes.includes(message.type)) {
              sendSenderAction(message, CONST.SENDER_ACTION_MESSAGES.MARK_SEEN);
              setTimeout(_ => sendSenderAction(message, CONST.SENDER_ACTION_MESSAGES.TYPING_ON), 1200);
              setTimeout(_ => messageHandler.handle(message), 2500);
            } else {
              console.log(`message ignored: ${message.type}`);
            }

          });
        } else {
          console.log('!!! no messaging attribute on entry');
        }
      });
    } catch (e) {
      console.log('Error handling message', e);
    }
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(message) {
  const messageBodies = transformer.to(message);
  sendSenderAction(message, CONST.SENDER_ACTION_MESSAGES.TYPING_OFF);
  for (let messageBody of messageBodies) {
    const fbMessage = {
      recipient: {
        id: message.userDetails.id,
      },
      messaging_type: CONST.MESSAGING_TYPE.RESPONSE,
      message: messageBody,
    };
    await _sendMessage(fbMessage, message.customerId);
  }

}

function sendSenderAction(message, state) {
  const psid = message.userDetails.id;
  const outgoingMessage = {
    recipient: {
      id: psid,
    },
    messaging_type: CONST.MESSAGING_TYPE.RESPONSE,
    sender_action: state,
  };
  _sendMessage(outgoingMessage, message.customerId);
}

async function _sendMessage(message, customerId) {
  console.log('[FacebookProvider] Outgoing message', JSON.stringify(message));
  const req = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    method: 'POST',
    params: { 'access_token': config.pageTokens[customerId] },
    data: message
  };
  try {
    const res = await axios(req);
    console.log('[FacebookProvider] message sent!', res.data);
  } catch (e) {
    console.error(`[FacebookProvider] Unable to send message: ${e.response.status} ${e.response.statusText}`, e.response.data);
  }
}

module.exports = {
  router,
  sendMessage,
  sendSenderAction,
};
