module.exports = {
  devServer: {
    port: 8081,
    allowedHosts: [
      '.natiziv.com',
      '.tagoose.com',
      '.ngrok.io',
    ],
    proxy: {
      '/api/conversation': {
        target: 'http://localhost:8080',
      },
      '/api/order': {
        target: 'http://localhost:3000',
      }
    }
  }
};