const axios = require('axios');

const API_KEY = 'AIzaSyANWevOyd82-eoNOA5mssoiyIE1eq-teqQ';
const URL = ({lat, long}) => `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${API_KEY}`;

async function cordsToAddress(cords) {
  try {
    const res = await axios.get(URL(cords));
    return res.data.results[0].formatted_address;
  } catch (err) {
    console.log('Could not resolve address', cords, err);
    return null;
  }
}

module.exports = {cordsToAddress};
