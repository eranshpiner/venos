# venos

Venos Project Repository
## Components

### Conversation service
### Payment service
### Reporting service
### Configuration service
### Order service 
  

- ngrok http 8081
- cd checkout-page && yarn serve
- cd conversationService && yarn start --server:orderServiceDomain=DOMAIN_FROM_NGROK
- cd orderService && yarn start --server:conversationServiceDomain=DOMAIN_FROM_NGROK
- node dev.js --wh https://DOMAIN_FROM_NGROK (make sure accessToken and pageToken are yours)