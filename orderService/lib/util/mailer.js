const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const pug = require('pug');
const path = require('path');

const conf = require('../../config/conf');
const emailConf = conf.get('email');
const customers = conf.get('customers');

const brandNotificationEmailTemplate = pug.compileFile(path.resolve(__dirname, './../../template/brand-confirmation-email.pug'), {});
const customerConfirmationEmailTemplate = pug.compileFile(path.resolve(__dirname, './../../template/customer-confirmation-email.pug'), {});

const mgTransport = nodemailer.createTransport(mg({auth: emailConf.sender}));

function sendBrandNotificationEmail(order, transaction) {
  return new Promise((resolve, reject) => {
    mgTransport.sendMail({
      from: emailConf.from,
      to: [{
        name: `${order.orderOwner.firstName} ${order.orderOwner.lastName}`,
        address: customers[order.brandId].email,
      }],
      subject: `הזמנה חדשה ${transaction.id}`,
      html: brandNotificationEmailTemplate({order, transaction}),
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function sendCustomerConfirmationEmail(order, transaction) {
  return new Promise((resolve, reject) => {
    mgTransport.sendMail({
      from: emailConf.from,
      to: [{
        name: `${order.orderOwner.firstName} ${order.orderOwner.lastName}`,
        address: order.orderOwner.email || '7739985@gmail.com'
      }],
      subject: "הזמנתך התקבלה!",
      html: customerConfirmationEmailTemplate({order, transaction}),
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  sendBrandNotificationEmail,
  sendCustomerConfirmationEmail,
};