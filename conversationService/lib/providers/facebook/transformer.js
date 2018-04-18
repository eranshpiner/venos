'use strict';

const IncomingMessage = require('./../../dataModel/IncomingMessage');
const MESSAGE_TYPES = require('./../../dataModel/const').MESSAGE_TYPES;

function from(fbMessage) {
    const incomingMessage = new IncomingMessage(Date.now());

    incomingMessage.setVisitorId(fbMessage.sender.id);
    incomingMessage.setCustomerId(fbMessage.recipient.id);
    incomingMessage.setProvider('facebook');

    if (fbMessage.message) {
        incomingMessage.setMessageContent(fbMessage.message.text);
        if (fbMessage.message.is_echo === true) {
            incomingMessage.setMessageType(MESSAGE_TYPES.ECHO);
        } else if (fbMessage.message.quick_reply) {
            incomingMessage.setMessageType(MESSAGE_TYPES.QUICKREPLY);
            updateMessageFromPayload(fbMessage.message.payload, incomingMessage);
        } else if (fbMessage.message.attachments) {
            incomingMessage.setMessageType(MESSAGE_TYPES.ATTACHMENT);
        } else if (fbMessage.message.text) {
            incomingMessage.setMessageType(MESSAGE_TYPES.TEXT);
        } else {
            incomingMessage.setMessageType(MESSAGE_TYPES.UNKNOWN);
        }
    } else if (fbMessage.postback) {
        incomingMessage.setMessageType(MESSAGE_TYPES.POSTBACK);
        incomingMessage.setMessageContent(fbMessage.postback.title);
        updateMessageFromPayload(fbMessage.postback.payload, incomingMessage);
    } else {
        incomingMessage.setMessageType(MESSAGE_TYPES.UNKNOWN);
        console.log("unknown message");
    }

    return incomingMessage;

}

function updateMessageFromPayload(payload, incomingMessage) {
    const parsedPayload = parsePayload(payload);
    incomingMessage.setAction(parsedPayload.action);
    incomingMessage.setItemRef(parsedPayload.itemRef);
}

function parsePayload(payload) {
    try{
        return JSON.parse(payload);
    } catch (err) {
        console.log('error parsing payload: ', payload);
        return {};
    }
}


function to(outgoingMessage) {
    const message = {
        text: outgoingMessage.getMessageContent(),
    };

    if (outgoingMessage.getReplies())  {
        const replies = outgoingMessage.getReplies();
        message.quick_replies = replies.map(reply => {
            const quickReply = {
                content_type: "text",
                title: reply.getTitle(),
                payload: reply.getPayload(),
            };
            if (reply.getImageUrl()) {
                quickReply.image_url = reply.getImageUrl();
            }
            return quickReply;
        });
    }
    return message;

}

module.exports = { from, to };