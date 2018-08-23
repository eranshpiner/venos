const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const conf = require('../../config/conf').get('email');

const mgTransport = nodemailer.createTransport(mg({auth: conf.sender}));

function sendOrderConfirmationEmail(provider, providerOrder) {
  return new Promise((resolve, reject) => {
    mgTransport.sendMail({
      from: conf.from,
      to: [{
        name: `${providerOrder.orderInfo.firstName} ${providerOrder.orderInfo.lastName}`,
        address: providerOrder.orderInfo.email || '7739985@gmail.com'
      }],
      subject: "הזמנתך התקבלה!",
      text: JSON.stringify(providerOrder, null, 2)
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;