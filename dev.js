const args = require('minimist')(process.argv);
const axios = require('axios');
const ngrok = require('ngrok');
const concurrently = require('concurrently');
const {URL} = require('url');

const accessToken = '162763734389729|MI6bR4yJL3x57PZ9K0O1pn0w0B4';
const pageToken = 'EAACUCGKSEZBEBAIJOM9BQhVynA5W3Fdwfi7pUjye2ZBgCmKXmhSRNweSHZB86YxiNjCZBH1Yk9SBvroAntwz9sHSpWsGlYO6wjIGi5FRsw3Cwp2gOxZBfQ2TXp2VAmZBlnxcjOUaoMim0fuLht8ZCcWbw7ZAsTGTVmKXo7foSC0YBAZDZD';
const verifyToken = 'af5a72d5-c241-4472-b4ef-855b90165fd5';

async function updateFacebook(url) {
  const webHookConf = {
    object: 'page',
    callback_url: `${url}/api/conversation/providers/facebook`,
    active: true,
    fields: 'messages,messaging_postbacks',
    verify_token: verifyToken,
  };

  try {
    console.log('updating fb extensions thingi');
    await axios.post(`https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${pageToken}`, {
      whitelisted_domains: [
        'https://venos-stg.natiziv.com',
        'https://venos-prod.natiziv.com',
        url,
      ]
    });
    console.log('successfully set fb extensions thingi');
  } catch (err) {
    console.log('failed to set the fb thing');
  }

  try {
    console.log(`updating webhook url: ${webHookConf.callback_url}`);
    await axios.post(`https://graph.facebook.com/v3.1/subscriptions?access_token=${accessToken}`, webHookConf);
    console.log(`successfully set url: ${webHookConf.callback_url}`);
  } catch (err) {
    console.log('failed to update webhook.', err.response.data);
  }
}

async function startStack() {
  const url = await ngrok.connect({port: 8081, region: 'eu'});
  const host = (new URL(url)).host;

  concurrently([
    //'cd checkout-page && yarn serve',
    `cd conversationService && yarn start --server:orderServiceDomain=${host}`,
    `cd orderService && yarn start --server:conversationServiceDomain=${host}`,
  ]).then(() => {});

  function handle(signal) {
    ngrok.disconnect();
    ngrok.kill();
  }

  process.on('SIGINT', handle);
  process.on('SIGTERM', handle);
}

(async function() {
  if (args.wh) {
    await updateFacebook(args.wh).then(() => {});
  }
})();
