module.exports = {
  BASE: '/',
  WELCOME: '/welcome',
  ORDER: {
    ROOT: '/order',
    CATEGORIES: '/order/categories',
    CATEGORY: '/order/category',
    ITEM: {
      ROOT: '/order/item',
      EDIT: '/order/item/edit',
      CUSTOMIZATIONS: '/order/item/customizations',
    }
  },
  ORDER_DETAILS: {
    DELIVERY: {
      METHOD: '/delivery/method',
      SHIPPING: {
        ROOT: '/delivery/shipping',
        ADDRESS: {
          AUTO: '/delivery/shipping/address/auto',
          MANUAL: {
            ROOT: '/delivery/shipping/address/manual',
            CITY: '/delivery/shipping/address/manual/city',
            STREET: '/delivery/shipping/address/manual/street',
          },
          FLOOR_APT_ENT: '/delivery/shipping/address/floor-apt-ent'
        },
      },
      PICKUP: {
        ROOT: '/delivery/pickup',
        TIME: '/delivery/pickup/time',
      },
    },
  },
  CART: {
    ROOT: '/cart',
  },
  RESET: '/reset',
};
