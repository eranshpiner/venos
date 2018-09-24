const aws = require('aws-sdk');
const fs = require('fs');
const log = require('./../util/log')('Events');
const conf = require('./../../config/conf');

const s3 = new aws.S3({
  params: {
    Bucket: conf.get('server:aws:bucket'),
  },
  accessKeyId: conf.get('server:aws:id'),
  secretAccessKey: conf.get('server:aws:key'),
});


function fireEvent(event) {
  s3.putObject({
    ACL: 'public-read',
    Key: `event-${Date.now()}.json`,
    Body: JSON.stringify(event),
  }, (error, data) => {
    if (error) {
      log.error('Events: Failed to fire event.', error, event);
    } else {
      log.debug('Events: Successfully fired event.', event);
    }
  });
}

module.exports = {
  fireEvent,
};

s3.listObjectsV2({Prefix: 'event'}, console.log);
// s3.getObject({Key: 'event-1537784194977.json'}, (err, data) => console.log(data.Body.toString()));
