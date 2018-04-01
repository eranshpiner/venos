"use strict";

const request = require('request');
const niniHachi = require('./../../customers/niniHachi');

//Page is Messanger101 Community
const PAGE_ACCESS_TOKEN = "EAAXSuZCK0EJ0BAIuEnKSdaAnJtYwuwOCwcTohT1ZAEgktEeTHM9pRMifJwLRMJJZBsUdZBWOAe4AYgJDPM3MDZAsdSYGOR1VpZBJbHXNZB1UaKpzFDHPEdS3q134ss6IkMRKvugRF901yQqpJX4zkm1ZCSvZBTZC7CjESy8r2V9xQKkZCghEzZCDsMpv";

function handleIncomingMessage(req, res) {
    //This method is intended to handle all apsects of FB incoming message via webhook.
    //Following that it should transform the message to the internal data model and call the application processing
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
          // pass the event to the appropriate handler function
          if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);        
          } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
          }

      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
};

function handleOutgoingMessage() {
    //This method should handle all aspects of outoing message following a transformation of 
    //internal data model to FB data model 
};

function handleVerificationRequest(req, res) {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;
  
    //check if message is a quick reply
    if (received_message.quick_reply) {
        //we understand this is a response to one of out quick replies
        response = {
            "text": `You sent the message: "${received_message.text}", with payload ${received_message.quick_reply.payload}`
          }
    } else
    // Check if the message contains text
    if (received_message.text) {    
  
      // Create the payload for a basic text message
    //   response = {
    //     "text": `You sent the message: "${received_message.text}". Now send me an image!`
    //   }
        response =  {
            "text": "Welcome to Nini Hachi, What would you like to order today?",
            "quick_replies":[
              {
                "content_type":"text",
                "title":"First Course",
                "payload":"1"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Starters",
                "payload":"2"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Sashimi Dishes",
                "payload":"3"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Salads",
                "payload":"4"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Skewers",
                "payload":"5"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Soups",
                "payload":"6"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Noodles",
                "payload":"7"//,
                //"image_url":"http://example.com/img/red.png"
              },
              {
                "content_type":"text",
                "title":"Rice",
                "payload":"8"//,
                //"image_url":"http://example.com/img/red.png"
              }
            ]
          };
    } else if (received_message.attachments) {
    
      // Gets the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      console.log(`Got attachment with url: "${attachment_url}"`);
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    }  
  
    // Sends the response message
    callSendAPI(sender_psid, response);    
  }
  
  function handlePostback(sender_psid, received_postback) {
    let response;
    
    // Get the payload for the postback
    let payload = received_postback.payload;
  
    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }
  
  // Sends response messages via the Send API
  function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }  
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  
  }

exports.handleIncomingMessage = handleIncomingMessage;
exports.handleOutgoingMessage = handleOutgoingMessage;
exports.handleVerificationRequest = handleVerificationRequest;