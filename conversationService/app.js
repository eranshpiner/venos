const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());

const fb = require('./providers/fb');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/webhook', (req, res) => {

    fb.handleVerificationRequest(req, res);

});

app.post('/webhook', (req, res) => {  
 
    fb.handleIncomingMessage(req, res);
  
});

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});

//Run app, then load http://localhost:8080 in a browser to see the output.