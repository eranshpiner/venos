'use strict';

const providers = require('./providers');
const OutgoingMessage = require('./dataModel/OutgoingMessage');

const menu = require('./../customers/niniHachi.json');

function handle(visitorMessage) {
    const provider = providers[visitorMessage.getProvider()];
    const outgoingMessage = new OutgoingMessage();

    outgoingMessage.setMessageContent("boo");
    outgoingMessage.setVisitorId(visitorMessage.getVisitorId());

    provider.sendMessage(outgoingMessage);
}

module.exports = { handle };