const User = require('./models/User');
const Session = require('./models/Session');

async function getUserSession({userDetails, customerId}) {
  let session = await Session.get(userDetails.id);
  if (!session) {
    session = await Session.createOrUpdate(userDetails.id, {userDetails, customerId});
    User.createOrUpdate(userDetails.id, userDetails);
  }
  return session;
}

async function saveUserSession(session) {
  await Session.createOrUpdate(session.id, session);
}

async function resetSession(session) {
  await Session.remove(session.id)
}

module.exports = {getUserSession, saveUserSession, resetSession};
