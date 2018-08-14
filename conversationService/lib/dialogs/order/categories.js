const builder = require('botbuilder');

const menuUtils = require('./../../util/menu');

const FLOWS = require('./../../const/flows');
const MESSAGES = require('./../../const/messages');

module.exports = ({bot, provider, customer}) => {


  bot.dialog(FLOWS.ORDER.CATEGORIES,
    new builder.IntentDialog()
      .onBegin((session, args = {}) => {
        const context = session.userData;

        session.dialogData.pageNumber = parseInt(args.pageNumber, 10) || 1;
        const categories = menuUtils.getCategoriesReplies({customer, provider, pageNumber: session.dialogData.pageNumber});
        session.send(MESSAGES.ORDER.CATEGORY.CHOOSE_CATEGORY({context, categories}));
      })
      .onDefault((session) => {
        const context = session.userData;
        const category = menuUtils.findCategory(customer, session.message.text);
        if (!category) {
          const categories = menuUtils.getCategoriesReplies({customer, provider, pageNumber: session.dialogData.pageNumber});
          session.send(MESSAGES.ORDER.CATEGORY.RETRY_CATEGORY({context, categories}));
        } else {
          session.replaceDialog(FLOWS.ORDER.CATEGORY, {categoryId: category.id});
        }
      })
  );

};
