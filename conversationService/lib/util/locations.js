const googleMaps = require('@google/maps');

const Address = require('../models/Address');

const API_KEY = 'AIzaSyANWevOyd82-eoNOA5mssoiyIE1eq-teqQ';

const STREET_ADDRESS = 'street_address';

const googleMapsClient = googleMaps.createClient({
  key: API_KEY,
  language: 'iw',
  Promise: Promise
});

async function cordsToAddress(cords) {
  try {
    const latlng = {lat:cords.lat, lng:cords.long};
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
    console.log(JSON.stringify(responseArr));
  const arr = [];
  responseArr.forEach(function(address) {
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

//cordsToAddress({lat: 32.06193320000001, lng:34.7700711}).then(console.log);
//cordsToAddress({lat: 40.731, lng:-73.997}).then(console.log);


//strToAddress('Herzl St 20').then(console.log);
//strToAddress('ראשון לציון').then(console.log);

//strToAddress("ז'בוטינסקי 25 ראשון לציון דירה 5 קומה 3 כניסה 1").then(console.log);

//placeToAddress('ChIJ995Ut0W0AhURHDqLrE662QE').then(console.log);

//strToAddress('הרצל 20').then(console.log);

module.exports = {cordsToAddress, strToAddress, placeToAddress};
