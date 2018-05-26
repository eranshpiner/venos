const User = require('./models/User');
const Session = require('./models/Session');

async function getUserSession(userDetails) {
  let session = await Session.get(userDetails.id);
  if (!session) {
    session = await Session.createOrUpdate(userDetails.id, {userDetails});
    User.createOrUpdate(userDetails.id, userDetails);
  }
  return session;
}

async function saveUserSession(session) {
  await Session.createOrUpdate(session.id, session);
}

async function resetSession(session) {
  await Session.remove(session)
}

module.exports = {getUserSession, saveUserSession, resetSession};
