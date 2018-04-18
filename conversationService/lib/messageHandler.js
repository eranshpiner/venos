'use strict';

const providers = require('./providers');
const VisitorMessage = require('./dataModel/VisitorMessage');
const OutgoingMessage = require('./dataModel/OutgoingMessage');

function handle(visitorMessage) {
    if (ignoredMessageTypes.includes(visitorMessage.getMessageType())) {
        console.log('[MessageHandler] Ignoring unknown message', visitorMessage);
        return;
    }
    const provider = providers[visitorMessage.getProvider()];
    const outgoingMessage = new OutgoingMessage();

    outgoingMessage.setMessageContent("boo");
    outgoingMessage.setVisitorId(visitorMessage.getVisitorId());

    provider.sendMessage(outgoingMessage);
}

module.exports = { handle };