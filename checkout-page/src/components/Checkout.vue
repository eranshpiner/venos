<template>
    <f7-page>
        <f7-navbar back-link-force back-link-url="javascript:window.closeWebView()" title="ביצוע הזמנה" back-link="חזרה"></f7-navbar>

        <f7-block-header><h3>פרטי משלוח</h3></f7-block-header>
        <f7-block strong>
            <f7-list class="list-nohairline">
                <here-map></here-map>
                <f7-list-item link="/checkout/delivery/address" title="כתובת" after="חלמיש 7ב, הוד השרון"></f7-list-item>
                <f7-list-item link="#" title="הוראות לשליח" after=""></f7-list-item>
            </f7-list>
        </f7-block>


        <f7-block-header><h3>פרטי תשלום</h3></f7-block-header>
        <f7-block>
            <f7-list class="list-nohairline">
                <f7-list-item class="nohairline" link="#" title="אמצעי תשלום" after="VISA"></f7-list-item>
                <f7-list-item class="nohairline" title="טיפ" after="0 ש״ח"></f7-list-item>
                <f7-list-item-cell>
                    <f7-segmented rounded tag="p" style="padding-bottom: 15px; padding-right: 15px; padding-left: 15px;">
                        <f7-button rounded>ללא</f7-button>
                        <f7-button rounded>10%</f7-button>
                        <f7-button rounded>12%</f7-button>
                        <f7-button rounded active>15%</f7-button>
                        <f7-button rounded>17%</f7-button>
                    </f7-segmented>
                </f7-list-item-cell>
            </f7-list>
        </f7-block>

        <f7-block>
            <f7-button class="col" big fill raised>בצע הזמנה</f7-button>
        </f7-block>
    </f7-page>
</template>

<style>
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
import HereMap from './Map.vue';
import F7BlockHeader from 'framework7-vue/components/block-header';
import F7ListItem from 'framework7-vue/components/list-item';

export default {
  components: {
    F7ListItem,
    F7BlockHeader,
    HereMap,
  },
  methods: {
    onBackKeyDown() {
      alert('yay!');
    },
  },
};
</script>
