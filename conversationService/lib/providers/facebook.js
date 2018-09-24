const { Message: BotBuilderMessage } = require('botbuilder');
const Botly = require('botly');
const { Router } = require('express');

const MemoryBotStorage = require('./../store/memory');
const events = require('./../events/events');
const providerConf = require('./../../config/conf').get('providers:facebook');
const log = require('../util/log')('FacebookProvider');

class FacebookProvider {

  static router(customers) {
    const router = Router();

    const pageHandlers = {};
    Object.values(customers).forEach(customer => {
      if (customer.provider.name === 'facebook') {
        pageHandlers[customer.provider.id] = customer.provider;
      }
    });

    router.get('/', (req, res) => {
      if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === providerConf.verifyToken) {
        res.send(req.query['hub.challenge']);
      } else {
        res.status(403).send('Wrong validation token');
      }
    });

    router.post('/', (req, res) => {
      res.sendStatus(200);
      const { body } = req;
      try {
        if (body.object === 'page') {
          const messagesForPage = {};
          body.entry.forEach(entry => {
            if (pageHandlers[entry.id]) {
              messagesForPage[entry.id] = messagesForPage[entry.id] || [];
              messagesForPage[entry.id].push(entry);
            }
          });

          Object.entries(messagesForPage).forEach(([pageId, messages]) => {
            pageHandlers[pageId].handleMessage({body: {object: 'page', entry: messages} });
          });
        }
      } catch (err) {
        log.error(`Error handling facebook message: ${req.body}`, err);
      }
    });

    return router;
  }

  constructor(conf = {}) {
    this.name = 'facebook';
    this.id = conf.pageId;
    this.conf = conf;
    this.botly = this.api = new Botly(conf);
    this.userStore = conf.userStore || new MemoryBotStorage();
    this.sessionStore = conf.sessionStore || new MemoryBotStorage();

    this.botly.on('message', (sender, message, data) => {
      log.debug(`New incoming msg from ${sender}: ${JSON.stringify(message)}`);
      this.botly.sendAction({id: sender, action: Botly.CONST.ACTION_TYPES.MARK_SEEN});

      const msg = new BotBuilderMessage()
        .address({
          channelId: 'facebook',
          user: {id: sender},
          source: this.conf.pageId,
          conversation: {id: sender}
        })
        .timestamp()
        .text(data.text);

      _addAttachments(msg, data.attachments);
      events.fireEvent(msg); // todo format
      this.handler(msg.toMessage());
    });

    this.botly.on('postback', (sender, message, postback, ref) => {
      log.debug(`Got postback from ${sender}: ${postback}`);
      let msg = new BotBuilderMessage()
        .address({
          channelId: 'facebook',
          user: {id: sender},
          source: this.conf.pageId,
          conversation: {id: sender}
        })
        .timestamp()
        .text(postback === 'GET_STARTED' ? 'hi' : postback);

      events.fireEvent(msg); // todo format
      this.handler(msg.toMessage());
    });

    this.botly.on('optin', (sender, message, optin) => {
      log.info(`Got optin from ${sender}: ${optin}`, message);
    });

    this.botly.setGetStarted({pageId: this.conf.pageId, payload: 'GET_STARTED'}, (err, body) => {
      if (err || (body && body.error)) {
        log.error('Error while setting welcome message', err || (body && body.error));
      } else {
        log.debug('success setting welcome message', body);
      }
    });

    // TODO: fix
    //this.botly.setPersistentMenu({
    //  pageId: this.conf.pageId,
    //  buttons: [
    //    this.botly.createPostbackButton('About', 'action?about')
    //  ]
    //}, (err, body) => {
    //  if (err || (body && body.error)) {
    //    log.error('Error while setting persistent menu', err || (body && body.error));
    //  } else {
    //    log.debug('success setting persistent menu', body);
    //  }
    //});

    this.botly.on('account_link', (sender, message, link) => {
      log.info('link done', link);
    });

    this.botly.on('referral', (sender, message, ref) => {
      log.info('referral', ref);
    });
  }

  externalAction(sender, action, attachment) {
    const msg = new BotBuilderMessage()
      .address({
        channelId: 'facebook',
        user: {id: sender},
        source: this.conf.pageId,
        conversation: {id: sender}
      })
      .timestamp()
      .text(`action?${action}`);
    if (attachment) {
      msg.addAttachment(attachment);
    }
    events.fireEvent(msg); // todo format
    this.handler(msg.toMessage());
  }

  handleMessage(req) {
    return this.botly.handleMessage(req);
  }

  listen() {
    return this.botly.router();
  }

  onEvent(handler) {
    this.handler = handler;
  }

  getData(context, callback) {
    this.sessionStore.get(context.userId, (err, sessionData) => {
      log.debug('Got botSession', JSON.stringify(sessionData));
      if (sessionData) {
        callback(err, sessionData);
      } else { //new session
        this.userStore.get(context.userId, (err, user) => {
          if (err) {
            log.error(`Error getting user id ${id}`, err);
            callback(err, null);
          } else {
            let userData = _restorePrevUserData(user);
            callback(null, { userData });
          }
        });
      }
    });
  }

  saveData(context, data, callback) {
    let ops = 2;
    function cb(err) {
      if (!err) {
        if (--ops === 0) {
          callback(null);
        }
      }
      else {
        callback(err);
      }
    }
    this.sessionStore.save(context.userId, data, cb);
    this.userStore.save(context.userId, data.userData || {}, cb);
  }

  send(messages, done) {
    messages.reduce((p, msg) =>
      p.then(() =>
        new Promise((resolve, reject) => {
          events.fireEvent(msg); // todo: format
          this.postMessage(msg, (e, r) => e ? reject(e) : resolve(r));
        })), Promise.resolve())
      .then(() => done())
      .catch(done);
  }

  setTyping(id) {
    this.botly.sendAction({id: id, action: Botly.CONST.ACTION_TYPES.TYPING_ON});
  }

  postMessage(message, callback) {
    const recipientId = message.address.user.id;
    let replies;
    if (recipientId) {
      if (message.quickReplies && message.quickReplies.length) {
        replies = message.quickReplies.map((reply) => {
          if (reply && typeof reply === 'string') {
            return this.botly.createQuickReply(reply, reply);
          } else if (reply && reply.key && reply.value) {
            return this.botly.createQuickReply(reply.key, reply.value);
          } else if (reply && reply.content_type) {
            return reply;
          } else {
            return null;
          }
        });
      }
      if (replies) {
        replies = replies.filter((rep) => rep !== null);
      }


      if (message.receipt) {
        this.botly.sendReceipt({
          id: recipientId,
          payload: message.receipt,
        }, _createSendCallback(this.botly, recipientId, message, callback));
      } else if (message.url && message.title) {
        this.botly.sendButtons({
          id: recipientId,
          text: message.text,
          buttons: [botly.createWebURLButton(message.title, message.url)],
          quick_replies: message.quick_replies || replies
        }, _createSendCallback(this.botly, recipientId, message, callback));
      } else if (message.url) {
        this.botly.sendImage({
          id: recipientId,
          url: message.url,
          is_reusable: true,
          quick_replies: message.quick_replies || replies
        }, _createSendCallback(this.botly, recipientId, message, callback));
      } else if (message.listType === 'vertical') {
        if (message.elements.length === 1) {
          message.elements[0].buttons = message.elements[0].buttons.concat(message.buttons || []);
          this.botly.sendGeneric({
            id: recipientId,
            elements: message.elements,
          }, _createSendCallback(this.botly, recipientId, message, callback));
        } else {
          this.botly.sendList({
            id: recipientId,
            elements: message.elements,
            buttons: message.buttons || [],
            top_element_style: Botly.CONST.TOP_ELEMENT_STYLE.COMPACT,
          }, _createSendCallback(this.botly, recipientId, message, callback));
        }
      } else if (message.buttons) {
        this.botly.sendButtons({
          id: recipientId,
          text: message.text,
          buttons: message.buttons,
          quick_replies: message.quick_replies || replies
        }, _createSendCallback(this.botly, recipientId, message, callback));
      }
      else if (message.elements) {
        this.botly.sendGeneric({
          id: recipientId,
          elements: message.elements,
          quick_replies: message.quick_replies || replies
        }, _createSendCallback(this.botly, recipientId, message, callback));
      }
      else if (message.type && message.url) {
        let attachment = {
          id: recipientId,
          payload: {
            url: message.url
          },
          type: message.type
        };
        this.botly.sendAttachment(attachment, (err, data) => {
          if (err || data.error) {
            log.error(`an error occurred while sending the response to ${recipientId}`, err || data.error);
          }
        });
      }
      else {
        this.botly.sendText({
          id: recipientId,
          text: message.text,
          quick_replies: message.quick_replies || replies
        }, _createSendCallback(this.botly, recipientId, message, callback));
      }
    } else {
      callback(new Error('no recipient'));
    }
  }

  repliesPerPage() {
    return 8;
  }

  createListElement(element) {
    return this.botly.createListElement(element);
  }

  createButton(title, payload = '') {
    if (typeof payload === 'string' && payload.startsWith('http')) {
      return this.botly.createWebURLButton(title, payload, null, true);
    }
    return this.botly.createPostbackButton(title, payload || title);
  }
}

function _restorePrevUserData(user) {
  let userData = {};
  userData.returning = !!user;
  if (user) {
    userData.first_name = user.first_name;
    userData.last_name = user.last_name;
    if (user.timezone) {
      userData.timezone = user.timezone;
    }
  }
  return userData;
}

function _addAttachments(botBuilderMessage, attachments) {
  if (attachments) {
    for (let attachmentType in attachments) {
      if (attachments.hasOwnProperty(attachmentType)) {
        let attachment = attachments[attachmentType];
        attachment.forEach(item => {
          botBuilderMessage.addAttachment({
            type: attachmentType,
            value: item
          });
        })
      }
    }
  }
}

function _createSendCallback(api, recipientId, options, callback) {
  return function _sendCallback(err, data) {
    if (err || data.error) {
      log.error(`an error occurred while sending text the response to ${recipientId}`, err || data.error);
    }
    if (callback) {
      if (!options.delay) {
        callback(err, data);
      } else {
        api.sendAction({id: recipientId, action: Botly.CONST.ACTION_TYPES.TYPING_ON});
        setTimeout(() => {
          callback(err, data);
        }, options.delay || 1000);
      }
    }
  };
}

module.exports = FacebookProvider;
