<template>
    <f7-page>
        <f7-navbar back-link-force back-link-url="javascript:window.closeWebView()" title="פרטי איסוף עצמי" back-link="חזרה"></f7-navbar>

        <f7-block-header><h3>פרטי איסוף עצמי</h3></f7-block-header>
        <f7-block strong>
            <f7-list class="list-nohairline">
                <here-map
                        :city="deliveryInfo.city"
                        :street="deliveryInfo.street"
                        :houseNumber="deliveryInfo.houseNumber"
                ></here-map>
                <f7-list-item title="סניף" :after="branchAddress"></f7-list-item>
                <f7-list-item class="nohairline" title="זמן איסוף" :after="pickupTime"></f7-list-item>
                <f7-list-item-cell style="padding-left: 25px;">
                    <f7-segmented raised tag="p">
                        <f7-button :active="tipPercentage === 0" @click="setTip(0)">ללא</f7-button>
                        <f7-button :active="tipPercentage === 10" @click="setTip(10)">10%</f7-button>
                        <f7-button :active="tipPercentage === 12" @click="setTip(12)">12%</f7-button>
                        <f7-button :active="tipPercentage === 15" @click="setTip(15)">15%</f7-button>
                        <f7-button :active="tipPercentage === 17" @click="setTip(17)">17%</f7-button>
                        <f7-button :active="[0,10,12,15,17].indexOf($store.orderDetails.tipPercentage) === -1" @click="tipAmountPrompt">אחר</f7-button>
                    </f7-segmented>
                </f7-list-item-cell>
            </f7-list>
            <f7-button @click="next" class="col" big fill raised>המשך לתשלום</f7-button>
        </f7-block>
    </f7-page>
</template>

<style>
    .ios .segmented .button {
        border-left-width: 1px;
    }
    .list .item-after {
        margin-left: unset;
    }
    .list .item-link .item-inner, .list .list-button .item-inner {
        padding-right: 16px;
    }
    .list-nohairline.list {
        margin-top: 0;
        margin-bottom: 0;
    }
    .list-nohairline.list ul:before, .list-nohairline.list ul:after {
        display:none !important;
    }
</style>

<script>
import HereMap from './Map.vue';

export default {
  components: {
    HereMap,
  },
  data() {

    return {
      deliveryInfo: this.$store.orderDetails.orderOwner.deliveryInfo,
    };
  },
  created() {
  },
  computed: {
    pickupTime() {
      return 'todo';
    },
    branchAddress() {
      return `${this.deliveryInfo.street} ${this.deliveryInfo.houseNumber}, ${this.deliveryInfo.city}`;
    },
  },
  methods: {
    next() {
      this.$f7router.navigate('/checkout/payment');
    },
  },
};
</script>
