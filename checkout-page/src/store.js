import Vue from 'vue';

const store = new Vue({
  data: {
    orderDetails: {},
    paymentDetails: {},
    deliveryDetails: {},
  },
});

store.install = () => {
  Object.defineProperty(Vue.prototype, '$store', {
    get() {
      return store;
    },
  });
};

export default store;
