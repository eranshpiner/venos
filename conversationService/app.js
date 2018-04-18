const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());

const providers = module.exports.providers = require('./lib/providers');
console.log("Starting...");
app.get('/', (req, res) => {
    res.send('Hello World!');
});

Object.keys(providers).forEach(provider => {
    app.use('/providers', providers[provider].router);
});

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});