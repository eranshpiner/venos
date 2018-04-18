'use strict';

const providers = require('./providers');
const OutgoingMessage = require('./dataModel/OutgoingMessage');

function handle(visitorMessage) {
    const provider = providers[visitorMessage.getProvider()];
    const outgoingMessage = new OutgoingMessage();

    outgoingMessage.setMessageContent("boo");
    outgoingMessage.setVisitorId(visitorMessage.getVisitorId());

    provider.sendMessage(outgoingMessage);
}

module.exports = { handle };