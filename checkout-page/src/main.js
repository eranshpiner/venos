import Vue from 'vue';
import Framework7 from 'framework7/framework7.esm.bundle';
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle';
import '!!vue-style-loader!css-loader!framework7/css/framework7.css'; // eslint-disable-line
import '!!vue-style-loader!css-loader!framework7/css/framework7.rtl.min.css'; // eslint-disable-line
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';

import App from './App.vue';
import './registerServiceWorker';
import store from './store';

Vue.use(store);
Vue.component('icon', Icon);
Framework7.use(Framework7Vue);

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');

(function load(d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  const js = d.createElement(s);
  js.id = id;
  js.src = '//connect.facebook.net/en_US/messenger.Extensions.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.closeWebView = () => {
  const displayText = 'נא לסגור את החלון כדי לחזור לשיחה';
  try {
    window.MessengerExtensions.requestCloseBrowser(() => {
    }, () => {
      window.location.replace(`https://www.messenger.com/closeWindow/?display_text=${displayText}&display_image=`);
    });
  } catch (err) {
    window.alert(displayText); // eslint-disable-line
  }
};
