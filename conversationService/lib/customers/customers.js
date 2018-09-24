const botsConfig = require('./../../config/conf').get('bots');
const log = require('./../util/log')('Customers');
const Bot = require('./../bot/bot');

const bots = {};

Object.keys(botsConfig).forEach(botId => {
  bots[botId] = new Bot(botsConfig[botId], botId);
  log.info(`Successfully loaded bot ${botId}`);
});

module.exports = bots;
