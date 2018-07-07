module.exports = {
  RESPONSE_TYPE: {
    TEXT: 'text',
    CATEGORIES: 'categories',
    ITEMS: 'items',
    ITEM_CUSTOMIZATIONS: 'items-customizations',
    CART_SUMMARY: 'cart-summary',
    ADDRESS_LIST: 'addressList',
    ORDER_RECEIPT: 'order-receipt',
  },
  REPLY_TYPE: {
    TEXT: 'text',
    LOCATION: 'location',
  },
  DELIVERY_METHOD: {
    PICKUP: 'pickup',
    DELIVERY: 'delivery',
  },
  ACTIONS: {
    CHOOSE_DELIVERY_METHOD: 'dm',
    CHOOSE_DELIVERY_METHOD_PICKUP: 'pu',
    CHOOSE_DELIVERY_METHOD_DELIVERY: 'dl',
    CHOOSE_DELIVERY_ADDRESS: 'da',
    CHOOSE_CATEGORY: 'cc',
    CHOOSE_CUSTOMIZATION: 'choose_customization',
    CHOOSE_NOTES: 'cn',
    ADD_TO_CART: 'atc',
    REMOVE_FROM_CART: 'rfc',
    GET_CART: 'gc',
    EMPTY_CART: 'ec',
    CLICK_ITEM: 'ci',
    FIX_DELIVERY_ADDRESS: 'fda',
    APPROVE_DELIVERY_ADDRESS: 'ada',
    RESET_SESSION: 'reset_session',
    GET_MORE_INFO: 'get_more_info_on_item',
    MORE: 'more'
  }
};
