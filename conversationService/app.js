const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const path = require('path');

const providers = module.exports.providers = require('./lib/providers');
console.log("Starting...");

//remove technology exposure
app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
});

//short term to serve static files
app.use('/static',express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

Object.keys(providers).forEach(provider => {
    app.use('/providers', providers[provider].router);
});

app.listen(8081, () => {
    console.log('Example app listening on port 8080!');
});
