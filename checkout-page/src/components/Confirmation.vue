<template>
    <f7-page class="text-align-center">
        <f7-block-header class="text-align-center"><h1>הזמנתך נקלטה!</h1></f7-block-header>
        <icon name="check-circle" scale="10" style="color: #5fe100;"></icon>
        <p>מספר ההזמנה שלך הוא: {{transaction.id}}</p>
        <f7-button big fill raised @click="close">חזרה לשיחה</f7-button>
    </f7-page>
</template>

<script>

export default {
  data() {
    return {
      transaction: this.$store.transaction,
    };
  },
  methods: {
    close() {
      window.closeWebView();
    },
  },
};
</script>
