const googleMaps = require('@google/maps');

const CONST = require('./../const');
const Address = require('./../models/Address');

const API_KEY = 'AIzaSyANWevOyd82-eoNOA5mssoiyIE1eq-teqQ';

const STREET_ADDRESS = 'street_address';

const googleMapsClient = googleMaps.createClient({
  key: API_KEY,
  language: 'iw',
  Promise: Promise
});

async function cordsToAddress(cords) {
  try {
    const latlng = {lat: cords.lat, lng: cords.long};
    const response = await googleMapsClient.reverseGeocode({latlng: latlng}).asPromise();
    return responseToAddresses(response.json.results);
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function strToAddress(addressStr) {
  try {
    const response = await googleMapsClient.geocode({address: addressStr}).asPromise();
    return responseToAddresses(response.json.results);
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function placeToAddress(placeId) {
  try {
    const response = await googleMapsClient.reverseGeocode({place_id: placeId}).asPromise();
    return responseToAddresses(response.json.results);
  } catch (err) {
    console.log(err);
    return null;
  }
}

function responseToAddresses(responseArr) {
  const arr = [];
  responseArr.forEach(function (address) {
    if (address.types && address.types.includes(STREET_ADDRESS)) {
      let lat;
      let lng;
      if (address.geometry && address.geometry.location) {
        lat = address.geometry.location.lat;
        lng = address.geometry.location.lng;
      }
      arr.push(new Address(lat, lng, address.formatted_address, address.place_id));
    }
  });
  return arr;
}

function getPossibleAddresses(addresses, lang = 'he_IL') {
  const res = addresses.map((address) => ({
    type: CONST.REPLY_TYPE.TEXT,
    title: address.address,
    actions: [
      {
        text: address.address,
        clickData: {
          action: CONST.ACTIONS.CHOOSE_DELIVERY_ADDRESS,
          data: {
            address: address.address,
            placeId: address.placeId
          },
        }
      }
    ]
  }));
  return res.splice(0, 4); // todo limit 10
}

module.exports = {
  getPossibleAddresses,
  cordsToAddress,
  strToAddress,
  placeToAddress,
};
