const Message = require('../../models/Message');
const MESSAGE_TYPE = require('./const').MESSAGE_TYPE;
const RESPONSE_TYPE = require('../../const').RESPONSE_TYPE;
const REPLY_TYPE = require('../../const').REPLY_TYPE;

const responseTransformers = {};

function chunks(array = [], size = 0) {
  const results = [];
  while (array.length) {
    if (array.length - size > 0 && array.length < size*2) {
      // the last chunk is at least 2 items
      results.push(array.splice(0, size-1));
    } else {
      results.push(array.splice(0, size));
    }
  }
  return results;
}

function from(fbMessage) {
  const message = new Message(Date.now());

  message.userDetails = fbMessage.sender;
  message.customerId = fbMessage.recipient.id;
  message.provider = 'facebook';

  if (fbMessage.message) {
    message.messageContent = fbMessage.message.text;
    if (fbMessage.message.is_echo === true) {
      message.type = MESSAGE_TYPE.ECHO;
    } else if (fbMessage.message.quick_reply) {
      message.type = MESSAGE_TYPE.QUICKREPLY;
      const payload = parsePayload(fbMessage.message.quick_reply.payload);
      message.action = payload.action;
      message.actionData = payload.data;
    } else if (fbMessage.message.attachments) {
      message.type = MESSAGE_TYPE.ATTACHMENT;
      message.attachments = fbMessage.message.attachments;
    } else if (fbMessage.message.text) {
      message.type = MESSAGE_TYPE.TEXT;
    } else {
      message.type = MESSAGE_TYPE.UNKNOWN;
    }
  } else if (fbMessage.postback) {
    message.type = MESSAGE_TYPE.POSTBACK;
    message.messageContent = fbMessage.postback.title;
    const payload = parsePayload(fbMessage.postback.payload);
    message.action = payload.action;
    message.actionData = payload.data;
  } else if (fbMessage.delivery) {
    message.type = MESSAGE_TYPE.DELIVERY;
  } else if (fbMessage.read) {
    message.type = MESSAGE_TYPE.READ;
  } else {
    message.type = MESSAGE_TYPE.UNKNOWN;
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

function actionToButton(action = {}) {
  const button = {
    title: action.text,
  };
  if (action.clickData) {
    button.type = 'postback';
    button.payload = JSON.stringify(action.clickData);
  } else if (action.clickLink) {
    button.type = 'web_url';
    button.url = action.clickLink;
  }
  return button;
}

function replyToQuickReply(reply) {
  const quickReply = {};
  if (reply.type === REPLY_TYPE.LOCATION) {
    quickReply.content_type = 'location';
  } else {
    quickReply.content_type = 'text';
    quickReply.title = reply.text;
    quickReply.payload = JSON.stringify(reply.clickData);
    if (reply.imageUrl) {
      quickReply.image_url = reply.imageUrl;
    }
  }
  return quickReply;
}

function itemToGenericElement(item) {
  const genericElement = {
    title: item.title,
    subtitle: item.description,
  };
  if (item.actions) {
    genericElement.buttons = item.actions.map(actionToButton);
  }
  if (item.imageUrl) {
    genericElement.image_url = item.imageUrl;
  }
  return genericElement;
}

function itemToListElement(item) {
  return itemToGenericElement(item);
}

responseTransformers[RESPONSE_TYPE.TEXT] = (response) => {
  const fbResponse = {};

  fbResponse.text = response.text;
  if (response.replies) {
    fbResponse.quick_replies = response.replies.map(replyToQuickReply).splice(0, 10);
  }
  return fbResponse;
};

responseTransformers[RESPONSE_TYPE.CATEGORIES] = (response) => {
  return responseTransformers[RESPONSE_TYPE.TEXT](response);
};

responseTransformers[RESPONSE_TYPE.ITEMS] = (response) => {
  const items = chunks(response.items.splice(0,10), 10); // TODO: remove splice(0,10)
  return items.map(items => {
    const fbResponse = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: items.map(itemToGenericElement),
        },
      }
    };
    if (response.replies) {
      fbResponse.quick_replies = response.replies.map(replyToQuickReply).splice(0, 10);
    }
    return fbResponse;
  });
};

responseTransformers[RESPONSE_TYPE.ADDRESS_LIST] = (response) => {
  // due to FB list limit of min 2, we convert 1 item to a generic template
  if (response.items.length === 1) {
    //response.items[0].actions = response.items[0].actions.concat(response.items);
    return responseTransformers[RESPONSE_TYPE.ITEMS](response);
  }
  const fbResponse = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'list',
        top_element_style: 'compact',
        elements: response.items.map(itemToListElement),
      },
    },
  };
  return fbResponse;
};

responseTransformers[RESPONSE_TYPE.CART_SUMMARY] = (response) => {
// due to FB list limit of min 2, we convert 1 item to a generic template
  if (response.cartItems.length === 1) {
    response.cartItems[0].actions = response.cartItems[0].actions.concat(response.cartActions);
    response.items = response.cartItems;
    return responseTransformers[RESPONSE_TYPE.ITEMS](response);
  }
  const items = chunks(response.cartItems, 4);
  return items.map((itemsChunk, idx) => {
    const fbResponse = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'list',
          top_element_style: 'compact',
          elements: itemsChunk.map(itemToListElement),
        },
      },
    };
    if (idx === (items.length - 1) && response.cartActions) {
      fbResponse.attachment.payload.buttons = response.cartActions.map(actionToButton);
    }
    if (response.replies) {
      fbResponse.quick_replies = response.replies.map(replyToQuickReply).splice(0, 10);
    }
    return fbResponse;
  });
};

function to(message) {
  let res = [];
  message.responses.forEach(response => {
    if (responseTransformers[response.type]) {
      const transformed = responseTransformers[response.type](response);
      res = res.concat(Array.isArray(transformed) ? transformed : [transformed]);
    } else {
      res.push({text: response.text || ''});
    }
  });
  return res;
}

module.exports = {from, to};
