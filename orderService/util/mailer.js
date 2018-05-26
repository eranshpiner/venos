
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
      api_key: '918da8171f4403c7b7740795349092fd-115fe3a6-51cb68f1',
      domain: 'venos-mail.natiziv.com'
    }
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

function sendEmail(toArray, subject, text, callback) {
    nodemailerMailgun.sendMail({
        from: {name: 'Venos', address: 'venos@venos-mail.natiziv.com'},
        to: toArray,
        subject: subject,
        text: text
      }, callback);
}

exports.sendEmail = sendEmail;