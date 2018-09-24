<template>
    <f7-page>
        <f7-navbar title="עדכון כתובת" back-link="חזרה"></f7-navbar>

        <f7-block-header><h3>עדכון כתובת</h3></f7-block-header>
        <f7-block strong>
            <f7-list inline-labels no-hairlines-md>
                <f7-list-item>
                    <f7-label>עיר</f7-label>
                    <f7-input
                            type="text"
                            placeholder=""
                            :value="city"
                            @input="city = $event.target.value"
                    ></f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label>רחוב</f7-label>
                    <f7-input
                            type="text"
                            placeholder=""
                            :value="street"
                            @input="street = $event.target.value"
                    ></f7-input>
                </f7-list-item>
                <f7-list-item>
                    <f7-label>מס׳/כניסה</f7-label>
                    <f7-input
                            type="text"
                            placeholder=""
                            :value="houseNumber"
                            @input="houseNumber = $event.target.value"
                    ></f7-input>
                </f7-list-item>
            </f7-list>
            <f7-button @click="save" class="col" big fill raised>המשך</f7-button>
        </f7-block>
    </f7-page>
</template>

<style>
</style>

<script>

export default {
  data() {
    return {
      city: this.$store.orderDetails.orderOwner.deliveryInfo.city,
      street: this.$store.orderDetails.orderOwner.deliveryInfo.street,
      houseNumber: this.$store.orderDetails.orderOwner.deliveryInfo.houseNumber,
    };
  },
  methods: {
    save() {
      this.$store.orderDetails.orderOwner.deliveryInfo.city = this.city;
      this.$store.orderDetails.orderOwner.deliveryInfo.street = this.street;
      this.$store.orderDetails.orderOwner.deliveryInfo.houseNumber = this.houseNumber;
      this.$f7router.back();
    },
  },
};
</script>
