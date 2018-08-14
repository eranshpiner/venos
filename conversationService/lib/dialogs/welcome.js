const log = require('./../util/log')('WelcomeDialog');
const MESSAGES = require('./../const/messages');
const FLOWS = require('./../const/flows');

module.exports = ({bot, provider, customer}) => {
  bot.dialog(FLOWS.WELCOME, [
    (session, args, next) => {
      log.debug(`init, id: ${session.message.user.id}`);
      next();
    },
    (session, args, next) => {
      const context = session.userData;
      context.userDetails = context.userDetails || {};
      provider.api.getUserProfile(session.message.user.id, (err, info) => { // TODO: should be agnostic to provider
        if (!err && info && info.first_name) {
          Object.assign(context.userDetails, info);
        } else {
          //If we have nothing will throw an exception in template
          context.userDetails.first_name = '';
          context.userDetails.last_name = '';
          log.error('unable to get user info from facebook', err || info);
        }

        if (!context.returning) {
          session.send(MESSAGES.WELCOME({context, customer}));
          context.returning = true;
        }
        next();
      });

    },
    (session, results) => {
      session.endDialog();
    }
  ]);
};
