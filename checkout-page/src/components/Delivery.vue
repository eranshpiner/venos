<template>
    <f7-page>
        <f7-navbar back-link-force back-link-url="javascript:window.closeWebView()" title="פרטי משלוח" back-link="חזרה"></f7-navbar>

        <f7-block-header><h3>פרטי משלוח</h3></f7-block-header>
        <f7-block strong>
            <f7-list class="list-nohairline">
                <here-map
                        :city="deliveryInfo.city"
                        :street="deliveryInfo.street"
                        :houseNumber="deliveryInfo.houseNumber"
                ></here-map>
                <f7-list-item link="/checkout/delivery/address/" title="כתובת" :after="deliveryAddress"></f7-list-item>
                <f7-list-item link="#" @click="deliveryNotesPrompt" title="הוראות לשליח" :after="deliveryInfo.deliveryRemarks"></f7-list-item>
                <f7-list-item class="nohairline" title="דמי משלוח" :after="deliveryFee"></f7-list-item>
                <f7-list-item class="nohairline" title="טיפ" :after="tip"></f7-list-item>
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
      subTotal: this.$store.orderDetails.subTotal,
      deliveryInfo: this.$store.orderDetails.orderOwner.deliveryInfo,
      tipPercentage: this.$store.orderDetails.tipPercentage || 12,
    };
  },
  created() {
    this.$store.orderDetails.tipPercentage = this.$store.orderDetails.tipPercentage || 12;
    this.$store.orderDetails.tipAmount = this.$store.orderDetails.tipAmount || Math.floor(this.subTotal * 0.12);
  },
  computed: {
    tip() {
      return `₪${this.tipPercentage > 0 ? Math.floor(this.subTotal * (this.tipPercentage / 100)) : 0}`;
    },
    deliveryFee() {
      return `₪${this.$store.orderDetails.deliveryFee}`;
    },
    deliveryAddress() {
      return `${this.deliveryInfo.street} ${this.deliveryInfo.houseNumber}, ${this.deliveryInfo.city}`;
    },
  },
  methods: {
    setTip(amount) {
      this.$store.deliveryDetails.tipPercentage = amount;
      this.$store.deliveryDetails.tipAmount = this.tipPercentage > 0 ? Math.floor(this.subTotal * (amount / 100)) : 0;
      this.tipPercentage = amount;
    },
    deliveryNotesPrompt() {
      this.$f7.dialog.prompt('הכנס הערות לשלח', 'הערות לשליח', (notes) => {
        this.deliveryInfo.deliveryRemarks = notes;
      });
    },
    tipAmountPrompt() {
      this.$f7.dialog.prompt('הכנס אחוז טיפ', 'טיפ', (tip) => {
        this.setTip(!Number.isNaN(tip) && tip > 0 ? tip : 0);
      });
    },
    next() {
      this.$f7router.navigate('/checkout/payment');
    },
  },
};
</script>
