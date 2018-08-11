const googleMaps = require('@google/maps');
const axios = require('axios');

const log = require('./log')('LocationsUtil');
const CONST = require('./../const');
const Address = require('./../models/Address');

const API_KEY = 'AIzaSyANWevOyd82-eoNOA5mssoiyIE1eq-teqQ';

const STREET_ADDRESS = 'street_address';
const CITY = 'locality';

const googleMapsClient = googleMaps.createClient({
  key: API_KEY,
  language: 'iw',
  Promise: Promise
});

const appId = '2VU6zSzD6HPEaCLHPlxZ';
const appCode = 'd8Dhp1SqqPJkLcLWsUwDYQ';

const BASE_GEO_URL = `https://geocoder.api.here.com/6.2/geocode.json?app_id=${appId}&app_code=${appCode}&jsonattributes=1&country=IL`;
const BASE_REVERSE_GEO_URL = `https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?app_id=${appId}&app_code=${appCode}&jsonattributes=1&country=IL&mode=retrieveAddresses`;
const BASE_AUTO_COMPLETE_URL = `http://autocomplete.geocoder.api.here.com/6.2/suggest.json?app_id=${appId}&app_code=${appCode}&resultType=street`;

async function cityLookup(city = '') {
  try {
    const cities = new Set();
    const response = await axios(encodeURI(`${BASE_GEO_URL}&city=${city}`));
    const citiesList = response && response.data.response.view[0].result || [];
    citiesList.forEach(city => {
      if (city.matchLevel === 'city' && city.location && city.location.address && city.location.address.city) {
        cities.add({city: city.location.address.city, cityMapView: city.location.mapView });
      }
    });
    return [...cities];
  } catch (err) {
    log.error('Failed to lookup city',  err.response ? err.response : err);
    return null;
  }
}

async function streetLookup(cityStr = '', streetStr = '', cityMapView = {}) {
  try {
    const streets = new Set();
    let mapView;
    const {topLeft, bottomRight} = cityMapView;
    if (topLeft && bottomRight) {
      mapView = `&mapview=${topLeft.latitude},${topLeft.longitude};${bottomRight.latitude},${bottomRight.longitude}`;
    }
    let response = await axios(encodeURI(`${BASE_AUTO_COMPLETE_URL}&query=${streetStr}${mapView}`));
    let streetsList = response.data.suggestions || [];
    streetsList.forEach(street => {
      if (street.matchLevel === 'street' && street.address && street.address.city === cityStr && street.address.street) {
        streets.add(street.address.street);
      }
    });
    if (streets.size === 0) {
      response = await axios(encodeURI(`${BASE_AUTO_COMPLETE_URL}&query=${streetStr} ${cityStr}`));
      streetsList = response.data.suggestions || [];
      streetsList.forEach(street => {
        if (street.matchLevel === 'street' && street.address && street.address.city === cityStr && street.address.street) {
          streets.add(street.address.street);
        }
      });
    }
    return [...streets];
  } catch (err) {
    log.error('Failed to lookup street',  err.response ? err.response : err);
    return null;
  }
}


async function addressLookup(addressStr = '') {
  try {
    const addresses = [];
    const response = await axios(encodeURI(`${BASE_GEO_URL}&searchtext=${addressStr}`));
    const addressesList = response && response.data.response.view[0].result || [];
    addressesList.forEach(city => {
      //if (city.matchLevel === 'city' && city.location && city.location.address && city.location.address.city) {
        addresses.push(city.location.address);
      //}
    });
    return [...addresses];
  } catch (err) {
    log.error('Failed to lookup street',  err.response ? err.response : err);
    return null;
  }
}

async function locationLookup({lat, long, limit=1, radius=150}) {
  try {
    const response = await axios(encodeURI(`${BASE_REVERSE_GEO_URL}&prox=${lat},${long},${radius}&maxresults=${limit}`));
    const address = response && response.data.response.view[0].result[0];
    return [address.location.address];
  } catch (err) {
    log.error('Failed to lookup location by lat/long', err.response ? err.response : err);
    return null;
  }
}

async function cordsToAddress(cords) {
  try {
    const latlng = {lat: cords.lat, lng: cords.long};
    const response = await googleMapsClient.reverseGeocode({latlng: latlng}).asPromise();
    return responseToAddresses(response.json.results, true);
  } catch (err) {
    log.error('Failed to lookup lat/long to address', err);
    return null;
  }
}


async function strToAddress(addressStr) {
  try {
    const response = await googleMapsClient.geocode({address: addressStr, components: { country: 'IL' }}).asPromise();
    return responseToAddresses(response.json.results);
  } catch (err) {
    log.error(err);
    return null;
  }
}

async function placeToAddress(placeId) {
  try {
    const response = await googleMapsClient.reverseGeocode({place_id: placeId}).asPromise();
    return responseToAddresses(response.json.results);
  } catch (err) {
    log.error(err);
    return null;
  }
}

function responseToAddresses(responseArr, streetsOnly = false) {
  const arr = [];
  responseArr.forEach(function (address) {
    if (address.types && address.types.includes(STREET_ADDRESS) || (!streetsOnly && address.types.includes(CITY))) {
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
  cityLookup,
  streetLookup,
  locationLookup,
  addressLookup,
};
