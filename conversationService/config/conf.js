const nconf = require('nconf');
const path = require('path');

const conf = nconf
  .env({'separator': '_'})
  .argv();

['server', 'recognizers', 'customers', 'providers'].forEach(confType =>
  conf.file(confType, { file: path.join(__dirname, `/${confType}.json`) }));

module.exports = conf;
