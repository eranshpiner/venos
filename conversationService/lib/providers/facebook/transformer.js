'use strict';

const VisitorMessage = require('./../../dataModel/visitorMessage');

function from(fbMessage) {
    //handle happy flow
    const visitorMessage = new VisitorMessage(Date.now());
    console.log(`message created with id: ${visitorMessage.getId()}`);
    // Get the sender PSID
    visitorMessage.setVisitorId(fbMessage.sender.id);
    console.log(`Sender PSID: ${visitorMessage.getVisitorId()}`);

    visitorMessage.setProvider('facebook');

    // Check if the event is a message or postback and
    // pass the event to the appropriate handler function
    if (fbMessage.message) {

        if (fbMessage.message.is_echo === true) {
            visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.ECHO);
        }
        else if (fbMessage.message.text) {
            visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.text);
        } else if (fbMessage.message.quick_reply) {
            visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.quickReply);
        } else if (fbMessage.message.attachments) {
            visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.attachment);
        } else {
            visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.unknown);
        }


    } else if (fbMessage.postback) {
        visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.postback);
    } else {
        visitorMessage.setMessageType(VisitorMessage.MESSAGE_TYPES.unknown);
        console.log("unknown message");
    }

    return visitorMessage;

}


function to(outgoingMessage) {
    return {
        text: outgoingMessage.getMessageContent(),
    };

}

module.exports = { from, to };