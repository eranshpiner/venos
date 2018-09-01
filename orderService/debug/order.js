const secret = require('./../config/conf').get('server:jwt:secret');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const order = {
  "total": 18,
  "currency": "ILS",
  "brandId": "shabtai",
  "brandLocationId": "kfar-vitkin",
  "deliveryFee": 10,
  "remarks": "say what?",
  "orderOwner": {
    "firstName": "Nati",
    "lastName": "Ziv",
    "phone": "052-TOD0000",
    "email": "noemail@mail.com",
    "deliveryInfo": {
      "city": "הוד השרון",
      "street": "חלמיש",
      "houseNumber": "7",
      "apartment": "N/A",
      "floor": 0
    }
  },
  "orderItems": [
    {
      "itemId": "288493",
      "itemName": "אדממה",
      "quantity": 1,
      "unitPrice": 18,
      "price": 18
    }
  ],
  "orderPayment": {
    "paymentType": 1,
    "paymentSum": 18,
    "paymentName": "wtf?",
    "creditCard": "3434-3434-4334-3434",
    "creditCardExp": "09/20",
    "creditCardCvv": "000",
    "creditCardHolderId": "343545645454"
  },
  "conversationContext": {
    "userSessionId": "2415784195114429",
    "conversationProvider": "facebook",
    "botId": 6366
  }
};
const jwtToken = jwt.sign(JSON.stringify(order), secret);

const baseUrl = 'http://localhost:3000';

async function createOrder() {

  const res = await axios.post(`${baseUrl}/api/order`, { jwt: jwtToken });
  if (!res.data || !res.data.orderId) {
    console.log(':(', res.data, res.status);
    return;
  }

  console.log(res.data);
}
createOrder()
  .then(console.log)
  .catch(console.log);