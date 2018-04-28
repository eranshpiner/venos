const sessions = {};

async function get(id) {
  return sessions[id];
}

async function remove(id) {
  let session = await get(id);
  if (session) {
    delete sessions[id];
    session = null;
    return true;
  }
  return false;
}

async function createOrUpdate(id, data) {
  const session = await get(id);
  if (session) {
    Object.assign(session, data);
    return session;
  } else {
    sessions[id] = Object.assign({}, {id}, data); // TODO: id generation
  }
  return sessions[id];
}

async function getOrCreate(id) {
  const session = await get(id);
  if (session) {
    return session;
  } else {
    sessions[id] = {id};
    return sessions[id];
  }
}

module.exports = {get, remove, createOrUpdate, getOrCreate};
