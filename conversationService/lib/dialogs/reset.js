const log = require('./../util/log')('ResetDialog');
const MESSAGES = require('./../const/messages');
const FLOWS = require('./../const/flows');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.RESET, [
    (session, args, next) => {
      log.debug('User session reset', session.userData);
      delete session.userData;
      session.userData = {};
      session.send(MESSAGES.RESET.SUCCESSFULLY_RESET());
      session.clearDialogStack();
      session.replaceDialog(FLOWS.BASE);
    },
  ]);
};
