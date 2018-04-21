'use strict';

const Message = require('./../../dataModel/Message');
const MESSAGE_TYPES = require('./../../dataModel/const').MESSAGE_TYPES;

function from(fbMessage) {
  const message = new Message(Date.now());

  message.userDetails = fbMessage.sender;
  message.customerId = fbMessage.recipient.id;
  message.provider = 'facebook';

  if (fbMessage.message) {
    message.messageContent = fbMessage.message.text;
    if (fbMessage.message.is_echo === true) {
      message.type = MESSAGE_TYPES.ECHO;
    } else if (fbMessage.message.quick_reply) {
      message.type = MESSAGE_TYPES.QUICKREPLY;
      const payload = parsePayload(fbMessage.message.quick_reply.payload);
      message.action = payload.action;
      message.actionData = payload.data;
    } else if (fbMessage.message.attachments) {
      message.type = MESSAGE_TYPES.ATTACHMENT;
    } else if (fbMessage.message.text) {
      message.type = MESSAGE_TYPES.TEXT;
    } else {
      message.type = MESSAGE_TYPES.UNKNOWN;
    }
  } else if (fbMessage.postback) {
    message.type = MESSAGE_TYPES.POSTBACK;
    message.messageContent = fbMessage.postback.title;
    const payload = parsePayload(fbMessage.postback.payload);
    message.action = payload.action;
    message.actionData = payload.data;
  } else {
    message.type = MESSAGE_TYPES.UNKNOWN;
  }

  return message;

}

function parsePayload(payload) {
  try {
    return JSON.parse(payload);
  } catch (err) {
    console.log('error parsing payload: ', payload);
    return {};
  }
}


function to(message) {
  const fbMessage = {};

  // Templates
  if (message.response.elements) {
    const elements = message.response.elements.map(el => {
      const element = {
        title: el.title,
        subtitle: el.description,
        image_url: el.image_url,
        buttons: []
      };
      if (el.actions) {
        el.actions.forEach(action => {
          element.buttons.push({
            type: 'postback',
            title: action.title,
            payload: JSON.stringify(action.payload),
          });
        });
      }
      if (el.image_url) {
        element.image_url = el.image_url;
      }
      return element;
    });

    fbMessage.attachment = {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements,
      },
    };
  } else {
    fbMessage.text = message.response.content;
    // Quick Replies
    if (message.response.replies) {
      const replies = message.response.replies;
      fbMessage.quick_replies = replies.map(reply => {
        const quickReply = {
          content_type: 'text',
          title: reply.title,
          payload: JSON.stringify(reply.payload),
        };
        if (reply.imageUrl) {
          quickReply.image_url = reply.imageUrl;
        }
        return quickReply;
      });
    }
  }

  return fbMessage;

}

module.exports = {from, to};
