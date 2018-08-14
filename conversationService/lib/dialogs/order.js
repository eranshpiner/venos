const FLOWS = require('./../const/flows');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.ORDER.ROOT, [
    (session, args, next) => {
      session.beginDialog(FLOWS.ORDER.CATEGORIES);
    }
    ]);
};
