const customersConfig = require('./../../config/conf').get('customers');
const log = require('./../util/log')('Customers');
const Bot = require('./../bot/bot');

const customers = {};

Object.keys(customersConfig).forEach(customer => {
  customers[customer] = new Bot(customersConfig[customer]);
  log.info(`Successfully loaded customer ${customer}`);
});

module.exports = customers;
