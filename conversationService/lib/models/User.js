
const users = {};

async function get(userId) {
    return users[userId];
}

async function createOrUpdate(userId, data) {
  const user = await get(userId);
  let userModel = _buildModel(data, user);
  if (user) {
    Object.assign(user, userModel);
  } else {
    userModel.id = userId;
    users[userId] = userModel;
  }
}


function _buildModel(data, currentUser) {
  let model = {};
  Object.assign(model, data);
  // extra stuff if needed
  return model;
}

module.exports = {createOrUpdate, get};
