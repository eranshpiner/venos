const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

const log = require('./../util/log')('DBModel');
const config = require('./../../config/conf');

const db = {};

function init() {
  db.sequelize = new Sequelize(
    config.get('db:database'),
    config.get('db:username'),
    config.get('db:password'),
    config.get('db'),
  );

  fs
    .readdirSync(path.resolve(__dirname))
    .filter(file => (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-3) === '.js'))
    .forEach((file) => {
      const model = db.sequelize.import(path.resolve(__dirname, file));
      db[model.name] = model;
    });


  Object.keys(db).forEach(model => {
    if (db[model].associate) {
      db[model].associate(db);
    }
  });

  db.sequelize
  .authenticate()
  .then(() => {
    log.info('DB: Successfully initialized DB models and connected.');
  })
  .catch(err => {
    log.info('DB: Error connecting to DB.', err);
  });
}

init();

module.exports = db;