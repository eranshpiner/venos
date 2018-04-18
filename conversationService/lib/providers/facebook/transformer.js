'use strict';

const IncomingMessage = require('./../../dataModel/IncomingMessage');

function from(fbMessage) {
    const incomingMessage = new IncomingMessage(Date.now());

    incomingMessage.setVisitorId(fbMessage.sender.id);
    incomingMessage.setCustomerId(fbMessage.recipient.id);
    incomingMessage.setProvider('facebook');

    if (fbMessage.message) {

        if (fbMessage.message.is_echo === true) {
            incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.ECHO);
        }
        else if (fbMessage.message.text) {
            incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.TEXT);
        } else if (fbMessage.message.quick_reply) {
            incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.QUICKREPLY);
        } else if (fbMessage.message.attachments) {
            incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.ATTACHMENT);
        } else {
            incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.UNKNOWN);
        }
    } else if (fbMessage.postback) {
        incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.POSTBACK);
    } else {
        incomingMessage.setMessageType(IncomingMessage.MESSAGE_TYPES.UNKNOWN);
        console.log("unknown message");
    }

    return incomingMessage;

}


function to(outgoingMessage) {
    return {
        text: outgoingMessage.getMessageContent(),
    };

}

module.exports = { from, to };