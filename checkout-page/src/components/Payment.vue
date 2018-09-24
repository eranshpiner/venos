<template>
    <f7-page>
        <f7-navbar title="פרטי תשלום" back-link="חזרה"></f7-navbar>

        <f7-block-header><h3>פרטי תשלום</h3></f7-block-header>
        <f7-block strong>
            <f7-list
                    form
                    inline-labels
                    no-hairlines-md
                    ref="form"
                    @submit="submit"
            >
                <f7-list-item>
                    <f7-label>אימייל</f7-label>
                    <f7-input
                            validate
                            required
                            error-message="נא להכניס כתובת אימייל תקינה"
                            type="email"
                            pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                            placeholder="לצורך משלוח אישור הזמנה"
                            :value="paymentDetails.email"
                            @input="paymentDetails.email = $event.target.value"
                    ></f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label>בעל הכרטיס</f7-label>
                    <f7-input
                            validate
                            required
                            error-message="נא להכניס שם"
                            type="text"
                            placeholder="שם מלא"
                            :value="paymentDetails.creditCardHolderId"
                            @input="paymentDetails.creditCardHolderId = $event.target.value"
                    >
                    </f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label>מספר כרטיס</f7-label>
                    <f7-input style="direction: ltr;">
                        <cleave
                                minlength="18"
                                type="tel"
                                v-model="paymentDetails.creditCardNumber"
                                :options="ccOptions"
                        ></cleave>
                        <div slot="info" class="cc-info" :class="{ valid: isCreditCardValid }">
                            <icon name="brands/cc-amex" scale="2" :class="{ active: ccType === 'amex' }"></icon>
                            <icon name="brands/cc-mastercard" scale="2" :class="{ active: ccType === 'mastercard' }"></icon>
                            <icon name="brands/cc-visa" scale="2" :class="{ active: ccType === 'visa' }"></icon>
                        </div>
                    </f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label>תוקף</f7-label>
                    <f7-input error-message="נא להכניס שם">
                        <cleave
                                validate
                                required
                                pattern="\d\d/\d\d"
                                minlength="5"
                                data-error-message="נא להכניס תוקף כרטיס"
                                v-model="paymentDetails.creditCardExp"
                                :options="ccExpOptions"
                        ></cleave>
                    </f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label>קוד CVV</f7-label>
                    <f7-input
                            validate
                            required
                            error-message="נא להכניס קוד בעל 3/4 ספרות"
                            type="tel"
                            pattern="\d*"
                            maxlength="4"
                            minlength="3"
                            placeholder="•••"
                            :value="paymentDetails.creditCardCvv"
                            @input="paymentDetails.creditCardCvv = $event.target.value"

                    ></f7-input>
                </f7-list-item>
                <input type="submit" class="button button-fill button-big button-raised" :value="`שלם ₪${total}`" />
            </f7-list>
        </f7-block>
    </f7-page>
</template>

<style>
    .cc-info .active {
        color: #f31128;
    }
    .cc-info.valid .active {
        color: #3ee167;
    }
    .cc-info svg {
        padding-right: 5px;
        padding-left: 5px;
    }
    .md .list .item-link .item-inner, .md .list .list-button .item-inner {
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
import axios from 'axios';

import Cleave from 'vue-cleave-component';

export default {
  components: {
    Cleave,
  },
  data() {
    return {
      paymentDetails: this.$store.paymentDetails,
      ccType: 'unknown',
      ccOptions: { creditCard: true, delimiter: '-', onCreditCardTypeChanged: this.onCreditCardTypeChanged },
      ccExpOptions: { date: true, datePattern: ['m', 'y'] },
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.form.$el.addEventListener('submit', this.submit);
    });
  },
  computed: {
    total() {
      return this.$store.orderDetails.subTotal + this.$store.orderDetails.tipAmount + this.$store.orderDetails.deliveryFee;
    },
    isCreditCardValid() {
      if (['visa', 'mastercard'].includes(this.ccType) && this.paymentDetails.creditCardNumber.length === 16) {
        return true;
      }
      if (['amex'].includes(this.ccType) && this.paymentDetails.creditCardNumber.length === 15) {
        return true;
      }
      return false;
    },
  },
  methods: {
    onCreditCardTypeChanged(type) {
      this.ccType = type;
    },
    isInvalid() {
      return !(
        this.isCreditCardValid &&
        this.$refs.form && this.$refs.form.$el.checkValidity()
      );
    },
    submit(e) {
      e.preventDefault();
      if (this.isInvalid()) {
        this.$f7.dialog.alert('אנא השלם את כל השדות');
      } else {
        this.$f7.dialog.preloader('שולח הזמנה...');
        axios.post(`/api/order/${this.$store.orderId}/pay`, {
          paymentDetails: this.$store.paymentDetails,
          deliveryDetails: this.$store.deliveryDetails,
        }).then((response) => {
          this.$store.transaction = response.data.transaction;
          this.$f7router.navigate('/checkout/confirmation');
          this.$f7.dialog.close();
        }).catch((err) => {
          console.log('Error submitting payment', err);
          this.$f7.dialog.close();
          if (err.response.status === 400) {
            this.$f7.dialog.alert('אחד הפרטים שהוזנו שגוי');
          } else {
            this.$f7.dialog.alert('שגיאה! אנא נסה שוב'); // TODO
          }
        });
      }
    },
  },
};
</script>
