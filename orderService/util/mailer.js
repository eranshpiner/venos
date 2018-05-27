
const util = require('util');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
      api_key: '918da8171f4403c7b7740795349092fd-115fe3a6-51cb68f1',
      domain: 'venos-mail.natiziv.com'
    }
}

const mgTransport = nodemailer.createTransport(mg(auth));

function sendOrderConfirmationEmail(order, orderId, transactionId, callback) {

    // const html = util.format(
    //     'Hello %s!<br><br> Venos sent your order to "%s". <br>The order number is - [%s]. <br> The confirmation id with "%s" is - [%s].<br><br> Enjoy!<br> <br> The Venos Team. ', 
    //     order.orderOwner.firstName, 
    //     order.brandId, 
    //     orderId,
    //     order.brandId, 
    //     transactionId
    // );

    // const toArray = [{name: order.orderOwner.firstName, address: order.orderOwner.email}];

    // mgTransport.sendMail({
    //     from: {name: 'Venos', address: 'venos@venos-mail.natiziv.com'},
    //     to: toArray,
    //     subject: "Your order was sent!",
    //     html: html,
    // }, callback);

    // todo: for now, we just send the email to '7739985@gmail.com' (seba) with the order json as is 
    const toArray = [{name: order.brandId, address: '7739985@gmail.com'}];

    mgTransport.sendMail({
        from: {name: 'Venos', address: 'venos@venos-mail.natiziv.com'},
        to: toArray,
        subject: "Your order was sent!",
        text: JSON.stringify(order)
    }, callback);

}

exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;