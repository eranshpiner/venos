'use strict';

const messageHandler = require('./../../messageHandler');
const VisitorMessage = require('./../../dataModel/IncomingMessage');
const MESSAGE_TYPES = require('./../../dataModel/const').MESSAGE_TYPES;
const transformer = require('./transformer');
const CONST = require('./const');

const router = require('express').Router();
const request = require('request');

//Page is Messanger101 Community
const PAGE_ACCESS_TOKEN = 'EAAXSuZCK0EJ0BAIuEnKSdaAnJtYwuwOCwcTohT1ZAEgktEeTHM9pRMifJwLRMJJZBsUdZBWOAe4AYgJDPM3MDZAsdSYGOR1VpZBJbHXNZB1UaKpzFDHPEdS3q134ss6IkMRKvugRF901yQqpJX4zkm1ZCSvZBTZC7CjESy8r2V9xQKkZCghEzZCDsMpv';
const VERIFY_TOKEN = 'af5a72d5-c241-4472-b4ef-855b90165fd5';
const ENDPOINT = '/facebook';
const ignoredMessageTypes = [MESSAGE_TYPES.UNKNOWN, MESSAGE_TYPES.ECHO];


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
    const body = req.body;
    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            if (entry.messaging) {
                const webhook_event = entry.messaging[0];
                console.log('[Facebook] Incoming message', webhook_event);

                const visitorMessage = transformer.from(webhook_event);
                if (!ignoredMessageTypes.includes(visitorMessage.getMessageType())) {
                    sendSenderAction(visitorMessage.getVisitorId(), CONST.SENDER_ACTION_MESSAGES.MARK_SEEN);
                    setTimeout(_ => sendSenderAction(visitorMessage.getVisitorId(), CONST.SENDER_ACTION_MESSAGES.TYPING_ON), 2000);
                    setTimeout(_ => messageHandler.handle(visitorMessage), 3500);
                }

            } else {
                console.log('!!! no messaging attribute on entry');
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function sendMessage(outgoingMessage) {
    const messageBody = transformer.to(outgoingMessage);
    const message = {
        recipient: {
            id: outgoingMessage.getVisitorId(),
        },
        messaging_type: CONST.MESSAGING_TYPE.RESPONSE,
        message: messageBody,
    };
    sendSenderAction(outgoingMessage.getVisitorId(), CONST.SENDER_ACTION_MESSAGES.TYPING_OFF);
    _sendMessage(message);
}

function sendSenderAction(psid, state) {
    const message = {
        recipient: {
            id: psid,
        },
        messaging_type: CONST.MESSAGING_TYPE.RESPONSE,
        sender_action: state,
    };
    _sendMessage(message);
}

function _sendMessage(message) {
    console.log('[FacebookProvider] Outgoing message', message);
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { 'access_token': PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: message
    }, (err, res, body) => {
        if (!err) {
            console.log('[FacebookProvider] message sent!')
        } else {
            console.error('[FacebookProvider] Unable to send message', err);
        }
    });
}

module.exports = {
    router,
    sendMessage,
    sendSenderAction,
};