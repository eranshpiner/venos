class MemoryBotStorage {

  constructor(store = {}) {
    this.store = store;
  }

  get(key, callback = () => {}) {
    callback(null, this.store[key] ? JSON.parse(this.store[key]) : null);
    return Promise.resolve(this.store[key] ? JSON.parse(this.store[key]) : null);
  }

  save(key, data, callback = () => {}) {
    this.store[key] = JSON.stringify(data);
    callback(null, JSON.parse(this.store[key]));
    return Promise.resolve(JSON.parse(this.store[key]));

  }
}

module.exports = MemoryBotStorage;
