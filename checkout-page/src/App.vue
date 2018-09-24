<template>
  <f7-app :params="f7params" class="color-theme-pink">
    <f7-statusbar></f7-statusbar>
    <f7-view main>
    </f7-view>
  </f7-app>
</template>

<script>
import axios from 'axios';

import DeliveryPage from './components/Delivery.vue';
import PickupPage from './components/Pickup.vue';
import AddressPage from './components/Address.vue';
import PaymentPage from './components/Payment.vue';
import ConfirmationPage from './components/Confirmation.vue';

export default {
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.$f7ready((f7) => {
      f7.dialog.preloader('טוען הזמנה...');

      this.$store.jwt = urlParams.get('jwt');

      axios.post('/api/order', { jwt: this.$store.jwt })
        .then((response) => {
          const { orderId, order } = response.data;
          this.$store.orderDetails = order;
          this.$store.orderId = orderId;
          f7.dialog.close();
          if (order.deliveryMethod === 'shipping') {
            f7.router.navigate('/checkout/delivery/', { animate: false });
          } else {
            f7.router.navigate('/checkout/pickup/', { animate: false });
          }
        })
        .catch((err) => {
          console.log(err);
          f7.dialog.close();
          f7.dialog.alert('לא הצלחנו לעבד את ההזמנה שלך', 'אוי לא!', () => {
            window.closeWebView();
          });
        });
    });
  },
  data() {
    return {
      f7params: {
        id: 'com.tagoose.web',
        name: 'ביצוע הזמנה',
        theme: 'auto',
        routes: [
          {
            path: '/checkout/',
            component: DeliveryPage,
          },
          {
            path: '/checkout/delivery/',
            component: DeliveryPage,
            routes: [
              {
                path: 'address/',
                component: AddressPage,
              },
            ],
          },
          {
            path: '/checkout/pickup/',
            component: PickupPage,
          },
          {
            path: '/checkout/payment',
            component: PaymentPage,
          },
          {
            path: '/checkout/confirmation',
            component: ConfirmationPage,
          },
        ],
      },
    };
  },
};
</script>
