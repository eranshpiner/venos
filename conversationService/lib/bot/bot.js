const builder = require('botbuilder');
const path = require('path');

const providers = require('./../providers');
const dialogs = require('./../dialogs');

const FLOW = require('./../const/flows');

class Bot {
  constructor(conf) {
    this.conf = conf;

    this.customer = require(path.resolve(this.conf.confFile));

    this.provider = new providers[conf.provider](conf.providers[conf.provider]); // currently always FB

    this.bot = new builder.UniversalBot(this.provider);

    this.bot.beginDialogAction('moreCategories', FLOW.ORDER.CATEGORIES, {
      onSelectAction: (session, args, next) => {
        session.clearDialogStack();
        args.pageNumber = session.message.text.split('?')[2];
        next();
      },
    });

    this.bot.beginDialogAction('chooseCategory', FLOW.ORDER.CATEGORY, {
      onSelectAction: (session, args, next) => {
        session.clearDialogStack();
        args.categoryId = session.message.text.split('?')[2];
        next();
      },
    });

    this.bot.beginDialogAction('addItem', FLOW.ORDER.ITEM.ROOT, {
      onSelectAction: (session, args, next) => {
        const params = session.message.text.split('?')[2].split('|');
        args.categoryId = params[0];
        args.itemId = params[1];
        next();
      },
    });

    this.bot.beginDialogAction('editItem', FLOW.ORDER.ITEM.EDIT, {
      onSelectAction: (session, args, next) => {
        args.itemId = session.message.text.split('?')[2];
        next();
      },
    });

    this.bot.beginDialogAction('cart', FLOW.CART.ROOT);

    this.bot.dialog(FLOW.BASE, [
      (session) => {
        session.beginDialog(FLOW.WELCOME);
      },
      (session) => {
        session.beginDialog(FLOW.ORDER_DETAILS.DELIVERY.METHOD);
      },
      (session) => {
        session.beginDialog(FLOW.ORDER.ROOT);
      },
    ]);

    Object.values(dialogs).forEach(dialog => typeof dialog === 'function' && dialog(this));

  }
}

module.exports = Bot;
